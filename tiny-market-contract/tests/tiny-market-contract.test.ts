import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;
const charlie = accounts.get("wallet_3")!;

// Mock NFT contract address (replace with actual mock addresses)
const mockNftContract = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mock-nft";
const mockFtContract = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mock-ft";

describe("Tiny Market Non-Custodial NFT Marketplace Tests", () => {
  // Whitelisting Tests
  describe("Whitelisting", () => {
    it("allows contract owner to whitelist asset contracts", () => {
      const { result } = simnet.callPublicFn(
        "tiny-market",
        "set-whitelisted",
        [Cl.principal(mockNftContract), Cl.bool(true)],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));

      const whitelisted = simnet.callReadOnlyFn(
        "tiny-market",
        "is-whitelisted",
        [Cl.principal(mockNftContract)],
        deployer
      );
      expect(whitelisted.result).toBeOk(Cl.bool(true));
    });

    it("allows contract owner to remove from whitelist", () => {
      simnet.callPublicFn(
        "tiny-market",
        "set-whitelisted",
        [Cl.principal(mockNftContract), Cl.bool(true)],
        deployer
      );

      const { result } = simnet.callPublicFn(
        "tiny-market",
        "set-whitelisted",
        [Cl.principal(mockNftContract), Cl.bool(false)],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));

      const whitelisted = simnet.callReadOnlyFn(
        "tiny-market",
        "is-whitelisted",
        [Cl.principal(mockNftContract)],
        deployer
      );
      expect(whitelisted.result).toBeOk(Cl.bool(false));
    });

    it("prevents non-owner from whitelisting", () => {
      const { result } = simnet.callPublicFn(
        "tiny-market",
        "set-whitelisted",
        [Cl.principal(mockNftContract), Cl.bool(true)],
        alice
      );

      expect(result).toBeErr(Cl.uint(2001)); // err-unauthorised
    });
  });

  // Listing Tests
  describe("Listing", () => {
    beforeEach(() => {
      // Whitelist contracts before each test
      simnet.callPublicFn(
        "tiny-market",
        "set-whitelisted",
        [Cl.principal(mockNftContract), Cl.bool(true)],
        deployer
      );
      simnet.callPublicFn(
        "tiny-market",
        "set-whitelisted",
        [Cl.principal(mockFtContract), Cl.bool(true)],
        deployer
      );
    });

    it("allows listing an NFT for STX", () => {
      const expiry = simnet.blockHeight + 1000;
      const { result } = simnet.callPublicFn(
        "tiny-market",
        "list-asset",
        [
          Cl.principal(mockNftContract),
          Cl.tuple({
            taker: Cl.none(),
            "token-id": Cl.uint(1),
            expiry: Cl.uint(expiry),
            price: Cl.uint(1000000),
            "payment-asset-contract": Cl.none()
          })
        ],
        alice
      );

      expect(result).toBeOk(Cl.uint(0));

      const listing = simnet.callReadOnlyFn(
        "tiny-market",
        "get-listing",
        [Cl.uint(0)],
        alice
      );

      expect(listing.result).toBeSome(
        Cl.tuple({
          maker: Cl.principal(alice),
          taker: Cl.none(),
          "token-id": Cl.uint(1),
          "nft-asset-contract": Cl.principal(mockNftContract),
          expiry: Cl.uint(expiry),
          price: Cl.uint(1000000),
          "payment-asset-contract": Cl.none()
        })
      );
    });

    it("allows listing an NFT for FT", () => {
      const expiry = simnet.blockHeight + 1000;
      const { result } = simnet.callPublicFn(
        "tiny-market",
        "list-asset",
        [
          Cl.principal(mockNftContract),
          Cl.tuple({
            taker: Cl.none(),
            "token-id": Cl.uint(2),
            expiry: Cl.uint(expiry),
            price: Cl.uint(500000),
            "payment-asset-contract": Cl.some(Cl.principal(mockFtContract))
          })
        ],
        alice
      );

      expect(result).toBeOk(Cl.uint(1));
    });

    it("allows listing with specific taker", () => {
      const expiry = simnet.blockHeight + 1000;
      const { result } = simnet.callPublicFn(
        "tiny-market",
        "list-asset",
        [
          Cl.principal(mockNftContract),
          Cl.tuple({
            taker: Cl.some(Cl.principal(bob)),
            "token-id": Cl.uint(3),
            expiry: Cl.uint(expiry),
            price: Cl.uint(1000000),
            "payment-asset-contract": Cl.none()
          })
        ],
        alice
      );

      expect(result).toBeOk(Cl.uint(2));

      const listing = simnet.callReadOnlyFn(
        "tiny-market",
        "get-listing",
        [Cl.uint(2)],
        alice
      );

      const listingValue = listing.result.expectSome();
      expect(listingValue).toBeOk(
        Cl.tuple({
          maker: Cl.principal(alice),
          taker: Cl.some(Cl.principal(bob)),
          "token-id": Cl.uint(3),
          "nft-asset-contract": Cl.principal(mockNftContract),
          expiry: Cl.uint(expiry),
          price: Cl.uint(1000000),
          "payment-asset-contract": Cl.none()
        })
      );
    });

    it("prevents listing with non-whitelisted NFT contract", () => {
      const nonWhitelisted = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.non-whitelisted";
      const expiry = simnet.blockHeight + 1000;
      
      const { result } = simnet.callPublicFn(
        "tiny-market",
        "list-asset",
        [
          Cl.principal(nonWhitelisted),
          Cl.tuple({
            taker: Cl.none(),
            "token-id": Cl.uint(1),
            expiry: Cl.uint(expiry),
            price: Cl.uint(1000000),
            "payment-asset-contract": Cl.none()
          })
        ],
        alice
      );

      expect(result).toBeErr(Cl.uint(2007)); // err-asset-contract-not-whitelisted
    });

    it("prevents listing with non-whitelisted payment contract", () => {
      const nonWhitelisted = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.non-whitelisted-ft";
      const expiry = simnet.blockHeight + 1000;
      
      const { result } = simnet.callPublicFn(
        "tiny-market",
        "list-asset",
        [
          Cl.principal(mockNftContract),
          Cl.tuple({
            taker: Cl.none(),
            "token-id": Cl.uint(1),
            expiry: Cl.uint(expiry),
            price: Cl.uint(1000000),
            "payment-asset-contract": Cl.some(Cl.principal(nonWhitelisted))
          })
        ],
        alice
      );

      expect(result).toBeErr(Cl.uint(2008)); // err-payment-contract-not-whitelisted
    });

    it("prevents listing with expired expiry", () => {
      const expiry = simnet.blockHeight - 1;
      
      const { result } = simnet.callPublicFn(
        "tiny-market",
        "list-asset",
        [
          Cl.principal(mockNftContract),
          Cl.tuple({
            taker: Cl.none(),
            "token-id": Cl.uint(1),
            expiry: Cl.uint(expiry),
            price: Cl.uint(1000000),
            "payment-asset-contract": Cl.none()
          })
        ],
        alice
      );

      expect(result).toBeErr(Cl.uint(1000)); // err-expiry-in-past
    });

    it("prevents listing with zero price", () => {
      const expiry = simnet.blockHeight + 1000;
      
      const { result } = simnet.callPublicFn(
        "tiny-market",
        "list-asset",
        [
          Cl.principal(mockNftContract),
          Cl.tuple({
            taker: Cl.none(),
            "token-id": Cl.uint(1),
            expiry: Cl.uint(expiry),
            price: Cl.uint(0),
            "payment-asset-contract": Cl.none()
          })
        ],
        alice
      );

      expect(result).toBeErr(Cl.uint(1001)); // err-price-zero
    });
  });

  // Cancellation Tests
  describe("Cancellation", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "tiny-market",
        "set-whitelisted",
        [Cl.principal(mockNftContract), Cl.bool(true)],
        deployer
      );
    });

    it("allows maker to cancel their listing", () => {
      const expiry = simnet.blockHeight + 1000;
      
      simnet.callPublicFn(
        "tiny-market",
        "list-asset",
        [
          Cl.principal(mockNftContract),
          Cl.tuple({
            taker: Cl.none(),
            "token-id": Cl.uint(1),
            expiry: Cl.uint(expiry),
            price: Cl.uint(1000000),
            "payment-asset-contract": Cl.none()
          })
        ],
        alice
      );

      const { result } = simnet.callPublicFn(
        "tiny-market",
        "cancel-listing",
        [Cl.uint(0)],
        alice
      );

      expect(result).toBeOk(Cl.uint(0));

      const listing = simnet.callReadOnlyFn(
        "tiny-market",
        "get-listing",
        [Cl.uint(0)],
        alice
      );
      expect(listing.result).toBeNone();
    });

    it("prevents non-maker from cancelling listing", () => {
      const expiry = simnet.blockHeight + 1000;
      
      simnet.callPublicFn(
        "tiny-market",
        "list-asset",
        [
          Cl.principal(mockNftContract),
          Cl.tuple({
            taker: Cl.none(),
            "token-id": Cl.uint(1),
            expiry: Cl.uint(expiry),
            price: Cl.uint(1000000),
            "payment-asset-contract": Cl.none()
          })
        ],
        alice
      );

      const { result } = simnet.callPublicFn(
        "tiny-market",
        "cancel-listing",
        [Cl.uint(0)],
        bob
      );

      expect(result).toBeErr(Cl.uint(2001)); // err-unauthorised
    });

    it("prevents cancelling non-existent listing", () => {
      const { result } = simnet.callPublicFn(
        "tiny-market",
        "cancel-listing",
        [Cl.uint(999)],
        alice
      );

      expect(result).toBeErr(Cl.uint(2000)); // err-unknown-listing
    });
  });

  // Fulfilment Tests (STX)
  describe("Fulfilment with STX", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "tiny-market",
        "set-whitelisted",
        [Cl.principal(mockNftContract), Cl.bool(true)],
        deployer
      );
    });

    it("allows fulfilling a listing with STX", () => {
      const expiry = simnet.blockHeight + 1000;
      const price = 1000000;
      
      simnet.callPublicFn(
        "tiny-market",
        "list-asset",
        [
          Cl.principal(mockNftContract),
          Cl.tuple({
            taker: Cl.none(),
            "token-id": Cl.uint(1),
            expiry: Cl.uint(expiry),
            price: Cl.uint(price),
            "payment-asset-contract": Cl.none()
          })
        ],
        alice
      );

      // Get Alice's initial balance
      const aliceBalance = simnet.getAssetsMap().get("STX")?.get(alice) || 0n;
      
      const { result, events } = simnet.callPublicFn(
        "tiny-market",
        "fulfil-listing-stx",
        [Cl.uint(0), Cl.principal(mockNftContract)],
        bob
      );

      expect(result).toBeOk(Cl.uint(0));
      
      // Verify STX transfer event
      const stxTransferEvents = events.filter(e => e.event === "stx_transfer_event");
      expect(stxTransferEvents.length).toBe(1);
      
      // Verify listing is deleted
      const listing = simnet.callReadOnlyFn(
        "tiny-market",
        "get-listing",
        [Cl.uint(0)],
        bob
      );
      expect(listing.result).toBeNone();
    });

    it("allows fulfilling a listing with specific taker", () => {
      const expiry = simnet.blockHeight + 1000;
      
      simnet.callPublicFn(
        "tiny-market",
        "list-asset",
        [
          Cl.principal(mockNftContract),
          Cl.tuple({
            taker: Cl.some(Cl.principal(bob)),
            "token-id": Cl.uint(1),
            expiry: Cl.uint(expiry),
            price: Cl.uint(1000000),
            "payment-asset-contract": Cl.none()
          })
        ],
        alice
      );

      const { result } = simnet.callPublicFn(
        "tiny-market",
        "fulfil-listing-stx",
        [Cl.uint(0), Cl.principal(mockNftContract)],
        bob
      );

      expect(result).toBeOk(Cl.uint(0));
    });

    it("prevents maker from fulfilling their own listing", () => {
      const expiry = simnet.blockHeight + 1000;
      
      simnet.callPublicFn(
        "tiny-market",
        "list-asset",
        [
          Cl.principal(mockNftContract),
          Cl.tuple({
            taker: Cl.none(),
            "token-id": Cl.uint(1),
            expiry: Cl.uint(expiry),
            price: Cl.uint(1000000),
            "payment-asset-contract": Cl.none()
          })
        ],
        alice
      );

      const { result } = simnet.callPublicFn(
        "tiny-market",
        "fulfil-listing-stx",
        [Cl.uint(0), Cl.principal(mockNftContract)],
        alice
      );

      expect(result).toBeErr(Cl.uint(2005)); // err-maker-taker-equal
    });

    it("prevents fulfilling with wrong taker", () => {
      const expiry = simnet.blockHeight + 1000;
      
      simnet.callPublicFn(
        "tiny-market",
        "list-asset",
        [
          Cl.principal(mockNftContract),
          Cl.tuple({
            taker: Cl.some(Cl.principal(bob)),
            "token-id": Cl.uint(1),
            expiry: Cl.uint(expiry),
            price: Cl.uint(1000000),
            "payment-asset-contract": Cl.none()
          })
        ],
        alice
      );

      const { result } = simnet.callPublicFn(
        "tiny-market",
        "fulfil-listing-stx",
        [Cl.uint(0), Cl.principal(mockNftContract)],
        charlie
      );

      expect(result).toBeErr(Cl.uint(2006)); // err-unintended-taker
    });

    it("prevents fulfilling expired listing", () => {
      const expiry = simnet.blockHeight - 1;
      
      simnet.callPublicFn(
        "tiny-market",
        "list-asset",
        [
          Cl.principal(mockNftContract),
          Cl.tuple({
            taker: Cl.none(),
            "token-id": Cl.uint(1),
            expiry: Cl.uint(expiry),
            price: Cl.uint(1000000),
            "payment-asset-contract": Cl.none()
          })
        ],
        alice
      );

      const { result } = simnet.callPublicFn(
        "tiny-market",
        "fulfil-listing-stx",
        [Cl.uint(0), Cl.principal(mockNftContract)],
        bob
      );

      expect(result).toBeErr(Cl.uint(2002)); // err-listing-expired
    });

    it("prevents fulfilling with wrong NFT contract", () => {
      const expiry = simnet.blockHeight + 1000;
      const wrongNftContract = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.different-nft";
      
      simnet.callPublicFn(
        "tiny-market",
        "set-whitelisted",
        [Cl.principal(wrongNftContract), Cl.bool(true)],
        deployer
      );

      simnet.callPublicFn(
        "tiny-market",
        "list-asset",
        [
          Cl.principal(mockNftContract),
          Cl.tuple({
            taker: Cl.none(),
            "token-id": Cl.uint(1),
            expiry: Cl.uint(expiry),
            price: Cl.uint(1000000),
            "payment-asset-contract": Cl.none()
          })
        ],
        alice
      );

      const { result } = simnet.callPublicFn(
        "tiny-market",
        "fulfil-listing-stx",
        [Cl.uint(0), Cl.principal(wrongNftContract)],
        bob
      );

      expect(result).toBeErr(Cl.uint(2003)); // err-nft-asset-mismatch
    });

    it("prevents fulfilling non-existent listing", () => {
      const { result } = simnet.callPublicFn(
        "tiny-market",
        "fulfil-listing-stx",
        [Cl.uint(999), Cl.principal(mockNftContract)],
        bob
      );

      expect(result).toBeErr(Cl.uint(2000)); // err-unknown-listing
    });
  });

  // Fulfilment Tests (FT)
  describe("Fulfilment with FT", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "tiny-market",
        "set-whitelisted",
        [Cl.principal(mockNftContract), Cl.bool(true)],
        deployer
      );
      simnet.callPublicFn(
        "tiny-market",
        "set-whitelisted",
        [Cl.principal(mockFtContract), Cl.bool(true)],
        deployer
      );
    });

    it("allows fulfilling a listing with FT", () => {
      const expiry = simnet.blockHeight + 1000;
      
      simnet.callPublicFn(
        "tiny-market",
        "list-asset",
        [
          Cl.principal(mockNftContract),
          Cl.tuple({
            taker: Cl.none(),
            "token-id": Cl.uint(1),
            expiry: Cl.uint(expiry),
            price: Cl.uint(1000000),
            "payment-asset-contract": Cl.some(Cl.principal(mockFtContract))
          })
        ],
        alice
      );

      const { result, events } = simnet.callPublicFn(
        "tiny-market",
        "fulfil-listing-ft",
        [
          Cl.uint(0),
          Cl.principal(mockNftContract),
          Cl.principal(mockFtContract)
        ],
        bob
      );

      expect(result).toBeOk(Cl.uint(0));
      
      // Verify listing is deleted
      const listing = simnet.callReadOnlyFn(
        "tiny-market",
        "get-listing",
        [Cl.uint(0)],
        bob
      );
      expect(listing.result).toBeNone();
    });

    it("prevents fulfilling FT listing with wrong payment contract", () => {
      const expiry = simnet.blockHeight + 1000;
      const wrongFtContract = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wrong-ft";
      
      simnet.callPublicFn(
        "tiny-market",
        "set-whitelisted",
        [Cl.principal(wrongFtContract), Cl.bool(true)],
        deployer
      );

      simnet.callPublicFn(
        "tiny-market",
        "list-asset",
        [
          Cl.principal(mockNftContract),
          Cl.tuple({
            taker: Cl.none(),
            "token-id": Cl.uint(1),
            expiry: Cl.uint(expiry),
            price: Cl.uint(1000000),
            "payment-asset-contract": Cl.some(Cl.principal(mockFtContract))
          })
        ],
        alice
      );

      const { result } = simnet.callPublicFn(
        "tiny-market",
        "fulfil-listing-ft",
        [
          Cl.uint(0),
          Cl.principal(mockNftContract),
          Cl.principal(wrongFtContract)
        ],
        bob
      );

      expect(result).toBeErr(Cl.uint(2004)); // err-payment-asset-mismatch
    });
  });

  // Multiple Listings Tests
  describe("Multiple Listings", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "tiny-market",
        "set-whitelisted",
        [Cl.principal(mockNftContract), Cl.bool(true)],
        deployer
      );
    });

    it("increments listing nonce correctly", () => {
      const expiry = simnet.blockHeight + 1000;
      
      // Create first listing
      simnet.callPublicFn(
        "tiny-market",
        "list-asset",
        [
          Cl.principal(mockNftContract),
          Cl.tuple({
            taker: Cl.none(),
            "token-id": Cl.uint(1),
            expiry: Cl.uint(expiry),
            price: Cl.uint(1000000),
            "payment-asset-contract": Cl.none()
          })
        ],
        alice
      );

      // Create second listing
      const { result } = simnet.callPublicFn(
        "tiny-market",
        "list-asset",
        [
          Cl.principal(mockNftContract),
          Cl.tuple({
            taker: Cl.none(),
            "token-id": Cl.uint(2),
            expiry: Cl.uint(expiry),
            price: Cl.uint(2000000),
            "payment-asset-contract": Cl.none()
          })
        ],
        bob
      );

      expect(result).toBeOk(Cl.uint(1));

      // Verify both listings exist
      const listing0 = simnet.callReadOnlyFn(
        "tiny-market",
        "get-listing",
        [Cl.uint(0)],
        alice
      );
      expect(listing0.result).toBeSome();

      const listing1 = simnet.callReadOnlyFn(
        "tiny-market",
        "get-listing",
        [Cl.uint(1)],
        alice
      );
      expect(listing1.result).toBeSome();
    });
  });
});
