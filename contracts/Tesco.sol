// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./LoyaltyToken.sol";
import "./Vault.sol";

contract Tesco {
    LoyaltyToken public loyaltyToken;
    Vault public tescoRewardNft;

    uint256 public constant loyaltyPointValueInWei = 10000;

    constructor(address _loyaltyTokenAddress, address _nftContractAddress) {
        loyaltyToken = LoyaltyToken(_loyaltyTokenAddress);
        tescoRewardNft = Vault(_nftContractAddress);

        // Initialize your products here
        products[1] = BeautyProduct(1, 10000, 0.0001 ether); // Example product 1
        products[2] = BeautyProduct(2, 10000, 0.00001 ether); // Example product 2
    }

    mapping(uint256 => BeautyProduct) public products;

    struct BeautyProduct {
        uint256 productId;
        uint256 quantity;
        uint256 price;
    }

    mapping(uint256 => address) public buyerInfo;
    mapping(address => mapping(uint256 => uint256))
        private beautyProductTracking;

    struct TokenAward {
        uint256 productId;
        uint256 tokensAwarded;
    }
    mapping(address => TokenAward[]) public tokenAwardsByBuyer;

    uint256 private buyerId = 0;
    enum PaymentMethod {
        Ether,
        LoyaltyPoints,
        Mixed
    }

    struct PurchaseDetail {
        uint256 productId;
        PaymentMethod paymentMethod;
        uint256 purchaseTime;
    }
    mapping(address => PurchaseDetail[]) public purchaseHistory;

    function Coffee() public payable {
        BeautyProduct storage product = products[1];
        require(msg.value >= product.price, "Insufficient funds for Product 1");
        require(product.quantity > 0, "Product 1 out of stock");
        finalizePurchase(1, PaymentMethod.Ether);
    }

    function tea() public payable {
        BeautyProduct storage product = products[2];
        require(msg.value >= product.price, "Insufficient funds for Product 2");
        require(product.quantity > 0, "Product 2 out of stock");
        finalizePurchase(2, PaymentMethod.Ether);
    }

    function approveLoyaltyTokenUsage(uint256 tokenAmount) public {
        loyaltyToken.approve(address(this), tokenAmount);
    }

    function buyProductWithMixedPayment(
        uint256 productId,
        uint256 loyaltyPoints
    ) public payable {
        BeautyProduct storage product = products[productId];
        require(product.quantity > 0, "Product out of stock");

        uint256 tokenCostInWei = calculateTokenCost(loyaltyPoints);

        uint256 remainingCostInEther = product.price - tokenCostInWei;
        require(msg.value >= remainingCostInEther, "Insufficient Ether sent");

        // Other logic remains the same
        product.quantity -= 1;
        beautyProductTracking[msg.sender][productId] += 1;
        finalizePurchase(productId, PaymentMethod.Mixed);
    }

    function finalizePurchase(
        uint256 productId,
        PaymentMethod method
    ) internal {
        BeautyProduct storage product = products[productId];
        product.quantity -= 1;
        beautyProductTracking[msg.sender][productId] += 1; // Track the purchase

        buyerId++;
        buyerInfo[buyerId] = msg.sender;

        // Optionally, award loyalty points
        uint256 pointsToAward = 10; // Define your logic for points
        dropPoints(msg.sender, pointsToAward, productId);

        purchaseHistory[msg.sender].push(
            PurchaseDetail({
                productId: productId,
                paymentMethod: method,
                purchaseTime: block.timestamp // Current block timestamp
            })
        );

        // Award NFTs based on the purchase conditions
        if (method == PaymentMethod.Mixed) {
            awardNftToBuyer(msg.sender, 2); // Award two NFTs for mixed payment
        } else {
            awardNftToBuyer(msg.sender, 1); // Award one NFT otherwise
        }
    }

    function awardNftToBuyer(address buyer, uint256 numberOfNfts) internal {
        for (uint256 i = 0; i < numberOfNfts; i++) {
            uint256 nftTokenId = findAvailableNftTokenId();
            if (nftTokenId != 0) {
                tescoRewardNft.transferFrom(address(this), buyer, nftTokenId);
            } else {
                // Handle the situation where no NFT is available
            }
        }
    }

    function findAvailableNftTokenId() internal view returns (uint256) {
        uint256 totalSupply = tescoRewardNft.totalSupply();
        for (uint256 i = 0; i < totalSupply; i++) {
            uint256 tokenId = tescoRewardNft.tokenByIndex(i);
            if (tescoRewardNft.ownerOf(tokenId) == address(this)) {
                return tokenId;
            }
        }
        return 0;
    }

    function calculateTokenCost(
        uint256 tokenAmount
    ) internal pure returns (uint256) {
        return tokenAmount * loyaltyPointValueInWei;
    }

    function dropPoints(
        address recipient,
        uint256 amount,
        uint256 productId
    ) internal {
        require(
            loyaltyToken.balanceOf(address(this)) >= amount,
            "Insufficient token balance in contract"
        );
        loyaltyToken.transfer(recipient, amount);
        tokenAwardsByBuyer[recipient].push(
            TokenAward({productId: productId, tokensAwarded: amount})
        );
    }

    function getTokenAwardsByBuyer(
        address buyer
    ) public view returns (TokenAward[] memory) {
        return tokenAwardsByBuyer[buyer];
    }

    function getTotalTokensHeldByBuyer(
        address buyer
    ) public view returns (uint256) {
        return loyaltyToken.balanceOf(buyer);
    }

    function calculateRemainingPayment(
        uint256 productId,
        uint256 loyaltyPoints
    ) public view returns (uint256 remainingInWei) {
        require(
            loyaltyToken.balanceOf(msg.sender) >= loyaltyPoints,
            "Insufficient loyalty tokens"
        );
        BeautyProduct storage product = products[productId];
        uint256 productPriceInWei = product.price;
        uint256 tokenCostInWei = calculateTokenCost(loyaltyPoints);

        if (productPriceInWei > tokenCostInWei) {
            remainingInWei = productPriceInWei - tokenCostInWei;
        } else {
            remainingInWei = 0;
        }
    }

    function getPurchaseAndRedemptionDetails(
        address buyer
    ) public view returns (PurchaseDetail[] memory, TokenAward[] memory) {
        return (purchaseHistory[buyer], tokenAwardsByBuyer[buyer]);
    }
}
