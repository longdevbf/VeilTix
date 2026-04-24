// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VeilTix
 * @dev Confidential ticket platform on Oasis Sapphire with marketplace support.
 */
contract VeilTix is ERC721, Ownable {

    uint256 public nextEventId;
    uint256 public nextTokenId;
    uint256 public nextListingId;

    address public verifier;

    uint256 public royaltyBps = 500;   // 5% to organizer
    uint256 public marketFeeBps = 250; // 2.5% to platform
    uint256 public accumulatedFees;

    constructor() ERC721("VeilTix Ticket", "VTX") Ownable(msg.sender) {}

    struct Event {
        address organizer;
        string name;
        string image;
        string location;
        string description;
        uint256 time;
        uint256 totalTickets;
        uint256 soldTickets;
        uint256 price;
        bool isActive;
    }

    struct Ticket {
        uint256 eventId;
        uint8 ticketType;
        bool isUsed;
    }

    struct EventRule {
        bool transferable;
        bool refundable;
        uint256 refundDeadline;
        uint256 maxPerUser;
    }

    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
    }

    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;
    mapping(uint256 => EventRule) public eventRules;
    mapping(address => mapping(uint256 => uint256)) public ticketsBought;
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => uint256) public tokenListing; // tokenId => listingId+1

    // ==================== EVENTS ====================

    event EventCreated(
        uint256 indexed eventId,
        address indexed organizer,
        string name,
        string image,
        string location,
        string description,
        uint256 time,
        uint256 totalTickets,
        uint256 price
    );

    event TicketPurchased(
        uint256 indexed tokenId,
        uint256 indexed eventId,
        address indexed buyer,
        uint8 ticketType
    );

    event TicketCheckedIn(uint256 indexed tokenId);

    event TicketListed(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );

    event ListingSold(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 price
    );

    event ListingCancelled(uint256 indexed listingId);

    // ==================== MODIFIERS ====================

    modifier onlyOrganizer(uint256 eventId) {
        require(msg.sender == events[eventId].organizer, "Not organizer");
        _;
    }

    modifier onlyVerifier() {
        require(msg.sender == verifier, "Not verifier");
        _;
    }

    // ==================== ADMIN ====================

    function setVerifier(address _verifier) external onlyOwner {
        verifier = _verifier;
    }

    function setRoyaltyBps(uint256 bps) external onlyOwner {
        require(bps <= 1000, "Max 10%");
        royaltyBps = bps;
    }

    function setMarketFeeBps(uint256 bps) external onlyOwner {
        require(bps <= 500, "Max 5%");
        marketFeeBps = bps;
    }

    function withdrawFees() external onlyOwner {
        uint256 amount = accumulatedFees;
        accumulatedFees = 0;
        payable(owner()).transfer(amount);
    }

    // ==================== EVENTS MANAGEMENT ====================

    function createEvent(
        string memory name,
        string memory image,
        string memory location,
        string memory description,
        uint256 time,
        uint256 totalTickets,
        uint256 price,
        bool transferable,
        bool refundable,
        uint256 refundDeadline,
        uint256 maxPerUser
    ) external {
        uint256 eventId = nextEventId++;

        events[eventId] = Event({
            organizer: msg.sender,
            name: name,
            image: image,
            location: location,
            description: description,
            time: time,
            totalTickets: totalTickets,
            soldTickets: 0,
            price: price,
            isActive: true
        });

        eventRules[eventId] = EventRule({
            transferable: transferable,
            refundable: refundable,
            refundDeadline: refundDeadline,
            maxPerUser: maxPerUser
        });

        emit EventCreated(eventId, msg.sender, name, image, location, description, time, totalTickets, price);
    }

    function cancelEvent(uint256 eventId) external onlyOrganizer(eventId) {
        events[eventId].isActive = false;
    }

    // ==================== PRIMARY TICKETS ====================

    function buyTicket(uint256 eventId, uint8 ticketType) external payable {
        Event storage e = events[eventId];
        EventRule storage rule = eventRules[eventId];

        require(e.isActive, "Event inactive");
        require(e.soldTickets < e.totalTickets, "Sold out");
        require(msg.value >= e.price, "Not enough ETH");
        require(
            ticketsBought[msg.sender][eventId] < rule.maxPerUser,
            "Limit exceeded"
        );

        uint256 tokenId = nextTokenId++;

        _safeMint(msg.sender, tokenId);

        tickets[tokenId] = Ticket({
            eventId: eventId,
            ticketType: ticketType,
            isUsed: false
        });

        ticketsBought[msg.sender][eventId]++;
        e.soldTickets++;

        payable(e.organizer).transfer(msg.value);

        emit TicketPurchased(tokenId, eventId, msg.sender, ticketType);
    }

    function transferTicket(address to, uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");

        uint256 eventId = tickets[tokenId].eventId;
        EventRule storage rule = eventRules[eventId];
        require(rule.transferable, "Transfer disabled");

        uint256 storedListingId = tokenListing[tokenId];
        if (storedListingId > 0) {
            uint256 listingId = storedListingId - 1;
            if (listings[listingId].active) {
                listings[listingId].active = false;
                emit ListingCancelled(listingId);
            }
            tokenListing[tokenId] = 0;
        }

        _transfer(msg.sender, to, tokenId);
    }

    function refundTicket(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");

        Ticket storage t = tickets[tokenId];
        Event storage e = events[t.eventId];
        EventRule storage rule = eventRules[t.eventId];

        require(rule.refundable, "Refund disabled");
        require(block.timestamp <= rule.refundDeadline, "Refund expired");
        require(!t.isUsed, "Already used");

        uint256 storedListingId = tokenListing[tokenId];
        if (storedListingId > 0) {
            uint256 listingId = storedListingId - 1;
            if (listings[listingId].active) {
                listings[listingId].active = false;
                emit ListingCancelled(listingId);
            }
            tokenListing[tokenId] = 0;
        }

        _burn(tokenId);
        payable(msg.sender).transfer(e.price);
    }

    // ==================== MARKETPLACE ====================

    function listTicket(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(price > 0, "Price must be > 0");

        uint256 eventId = tickets[tokenId].eventId;
        require(eventRules[eventId].transferable, "Transfer disabled");
        require(!tickets[tokenId].isUsed, "Ticket already used");

        uint256 storedListingId = tokenListing[tokenId];
        if (storedListingId > 0) {
            uint256 oldListingId = storedListingId - 1;
            if (listings[oldListingId].active) {
                listings[oldListingId].active = false;
                emit ListingCancelled(oldListingId);
            }
        }

        uint256 listingId = nextListingId++;
        listings[listingId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            active: true
        });

        tokenListing[tokenId] = listingId + 1;

        emit TicketListed(listingId, tokenId, msg.sender, price);
    }

    function buyListedTicket(uint256 listingId) external payable {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(ownerOf(listing.tokenId) == listing.seller, "Seller no longer owns ticket");
        require(msg.value >= listing.price, "Insufficient payment");

        uint256 tokenId = listing.tokenId;
        uint256 eventId = tickets[tokenId].eventId;

        uint256 royalty = (listing.price * royaltyBps) / 10000;
        uint256 fee = (listing.price * marketFeeBps) / 10000;
        uint256 sellerAmount = listing.price - royalty - fee;

        listing.active = false;
        tokenListing[tokenId] = 0;

        address seller = listing.seller;

        _transfer(seller, msg.sender, tokenId);

        payable(events[eventId].organizer).transfer(royalty);
        payable(seller).transfer(sellerAmount);
        accumulatedFees += fee;

        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }

        emit ListingSold(listingId, tokenId, msg.sender, listing.price);
    }

    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not seller");
        require(listing.active, "Already inactive");

        listing.active = false;
        tokenListing[listing.tokenId] = 0;

        emit ListingCancelled(listingId);
    }

    // ==================== CHECK-IN ====================

    function checkInTicket(uint256 tokenId) external {
        uint256 eventId = tickets[tokenId].eventId;
        require(
            msg.sender == events[eventId].organizer || msg.sender == verifier,
            "Not authorized"
        );
        require(_ownerOf(tokenId) != address(0), "Invalid ticket");

        Ticket storage t = tickets[tokenId];
        require(!t.isUsed, "Already used");

        t.isUsed = true;
        emit TicketCheckedIn(tokenId);
    }

    function markTicketUsed(uint256 tokenId) external onlyVerifier {
        require(_ownerOf(tokenId) != address(0), "Invalid ticket");

        Ticket storage t = tickets[tokenId];
        require(!t.isUsed, "Already used");

        t.isUsed = true;
        emit TicketCheckedIn(tokenId);
    }

    // ==================== VIEWS ====================

    function getEvent(uint256 eventId) external view returns (Event memory) {
        return events[eventId];
    }

    function getTicket(uint256 tokenId) external view returns (Ticket memory) {
        return tickets[tokenId];
    }

    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    function getEventStats(uint256 eventId)
        external
        view
        returns (
            uint256 sold,
            uint256 total,
            uint256 revenue
        )
    {
        Event storage e = events[eventId];
        sold = e.soldTickets;
        total = e.totalTickets;
        revenue = e.soldTickets * e.price;
    }
}
