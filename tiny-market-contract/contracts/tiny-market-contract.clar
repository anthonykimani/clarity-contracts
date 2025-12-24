;; tiny-market (non-custodial)
;; NFTs remain with the maker until fulfilment.

(use-trait nft-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)
(use-trait ft-trait  'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

(define-constant contract-owner tx-sender)

;; listing errors
(define-constant err-expiry-in-past (err u1000))
(define-constant err-price-zero (err u1001))

;; fulfil / cancel errors
(define-constant err-unknown-listing (err u2000))
(define-constant err-unauthorised (err u2001))
(define-constant err-listing-expired (err u2002))
(define-constant err-nft-asset-mismatch (err u2003))
(define-constant err-payment-asset-mismatch (err u2004))
(define-constant err-maker-taker-equal (err u2005))
(define-constant err-unintended-taker (err u2006))
(define-constant err-asset-contract-not-whitelisted (err u2007))
(define-constant err-payment-contract-not-whitelisted (err u2008))

;; ---------------------------------------------------------
;; Storage
;; ---------------------------------------------------------

(define-map listings
	uint
	{
		maker: principal,
		taker: (optional principal),
		token-id: uint,
		nft-asset-contract: principal,
		expiry: uint,
		price: uint,
		payment-asset-contract: (optional principal)
	}
)

(define-data-var listing-nonce uint u0)
(define-map whitelisted-asset-contracts principal bool)

;; ---------------------------------------------------------
;; Helpers
;; ---------------------------------------------------------

(define-read-only (is-whitelisted (asset-contract principal))
	(default-to false (map-get? whitelisted-asset-contracts asset-contract))
)

(define-public (set-whitelisted (asset-contract principal) (whitelisted bool))
	(begin
		(asserts! (is-eq contract-owner tx-sender) err-unauthorised)
		(ok (map-set whitelisted-asset-contracts asset-contract whitelisted))
	)
)

(define-private (transfer-nft
	(token-contract <nft-trait>)
	(token-id uint)
	(sender principal)
	(recipient principal))
	(contract-call? token-contract transfer token-id sender recipient)
)

(define-private (transfer-ft
	(token-contract <ft-trait>)
	(amount uint)
	(sender principal)
	(recipient principal))
	(contract-call? token-contract transfer amount sender recipient none)
)

;; ---------------------------------------------------------
;; Listing
;; ---------------------------------------------------------

(define-public (list-asset
	(nft-asset-contract <nft-trait>)
	(nft-asset {
		taker: (optional principal),
		token-id: uint,
		expiry: uint,
		price: uint,
		payment-asset-contract: (optional principal)
	}))
	(let ((listing-id (var-get listing-nonce)))
		(asserts!
			(is-whitelisted (contract-of nft-asset-contract))
			err-asset-contract-not-whitelisted
		)
		(asserts! (> (get expiry nft-asset) block-height) err-expiry-in-past)
		(asserts! (> (get price nft-asset) u0) err-price-zero)
		(asserts!
			(match (get payment-asset-contract nft-asset)
				payment (is-whitelisted payment)
				true)
			err-payment-contract-not-whitelisted
		)

		(map-set listings listing-id
			(merge
				{ maker: tx-sender, nft-asset-contract: (contract-of nft-asset-contract) }
				nft-asset
			)
		)
		(var-set listing-nonce (+ listing-id u1))
		(ok listing-id)
	)
)

(define-read-only (get-listing (listing-id uint))
	(map-get? listings listing-id)
)

;; ---------------------------------------------------------
;; Cancel
;; ---------------------------------------------------------

(define-public (cancel-listing (listing-id uint))
	(let ((listing (unwrap! (map-get? listings listing-id) err-unknown-listing)))
		(asserts! (is-eq (get maker listing) tx-sender) err-unauthorised)
		(map-delete listings listing-id)
		(ok listing-id)
	)
)

;; ---------------------------------------------------------
;; Fulfil checks
;; ---------------------------------------------------------

(define-private (assert-can-fulfil
	(nft-asset-contract principal)
	(payment-asset-contract (optional principal))
	(listing {
		maker: principal,
		taker: (optional principal),
		token-id: uint,
		nft-asset-contract: principal,
		expiry: uint,
		price: uint,
		payment-asset-contract: (optional principal)
	}))
	(begin
		(asserts! (not (is-eq (get maker listing) tx-sender)) err-maker-taker-equal)
		(asserts!
			(match (get taker listing)
				intended (is-eq intended tx-sender)
				true)
			err-unintended-taker
		)
		(asserts! (< block-height (get expiry listing)) err-listing-expired)
		(asserts! (is-eq (get nft-asset-contract listing) nft-asset-contract) err-nft-asset-mismatch)
		(asserts! (is-eq (get payment-asset-contract listing) payment-asset-contract) err-payment-asset-mismatch)
		(ok true)
	)
)

;; ---------------------------------------------------------
;; Fulfil (STX)
;; ---------------------------------------------------------

(define-public (fulfil-listing-stx
	(listing-id uint)
	(nft-asset-contract <nft-trait>))
	(let (
		(listing (unwrap! (map-get? listings listing-id) err-unknown-listing))
		(taker tx-sender)
	)
		(try! (assert-can-fulfil (contract-of nft-asset-contract) none listing))
		(try! (stx-transfer? (get price listing) taker (get maker listing)))
		(try!
			(transfer-nft
				nft-asset-contract
				(get token-id listing)
				(get maker listing)
				taker
			)
		)
		(map-delete listings listing-id)
		(ok listing-id)
	)
)

;; ---------------------------------------------------------
;; Fulfil (FT)
;; ---------------------------------------------------------

(define-public (fulfil-listing-ft
	(listing-id uint)
	(nft-asset-contract <nft-trait>)
	(payment-asset-contract <ft-trait>))
	(let (
		(listing (unwrap! (map-get? listings listing-id) err-unknown-listing))
		(taker tx-sender)
	)
		(try!
			(assert-can-fulfil
				(contract-of nft-asset-contract)
				(some (contract-of payment-asset-contract))
				listing
			)
		)
		(try!
			(transfer-ft
				payment-asset-contract
				(get price listing)
				taker
				(get maker listing)
			)
		)
		(try!
			(transfer-nft
				nft-asset-contract
				(get token-id listing)
				(get maker listing)
				taker
			)
		)
		(map-delete listings listing-id)
		(ok listing-id)
	)
)
