// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VeilTix is ERC721, Ownable {

    uint256 public nextEventId;
    uint256 public nextTokenId;

    address public verifier; // ROFL / backend verifier

    constructor() ERC721("VeilTix Ticket", "VTX") Ownable(msg.sender) {}

    struct Event {
        address organizer;
        string name;
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


    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;
    mapping(uint256 => EventRule) public eventRules;

    mapping(address => mapping(uint256 => uint256)) public ticketsBought;

    modifier onlyOrganizer(uint256 eventId) {
        require(msg.sender == events[eventId].organizer, "Not organizer");
        _;
    }

    modifier onlyVerifier() {
        require(msg.sender == verifier, "Not verifier");
        _;
    }


    function setVerifier(address _verifier) external onlyOwner {
        verifier = _verifier;
    }

    function createEvent(
        string memory name,
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
    }

    function cancelEvent(uint256 eventId) external onlyOrganizer(eventId) {
        events[eventId].isActive = false;
    }

    function buyTicket(uint256 eventId, uint8 ticketType) external payable {
        Event storage e = events[eventId];
        EventRule storage rule = eventRules[eventId];

        require(e.isActive, "Event inactive");
        require(e.soldTickets < e.totalTickets, "Sold out");
        require(msg.value >= e.price, "Not enough ETH");

        // Anti-scalper
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
    }

    function transferTicket(address to, uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");

        uint256 eventId = tickets[tokenId].eventId;
        EventRule storage rule = eventRules[eventId];

        require(rule.transferable, "Transfer disabled");

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

        // Burn ticket
        _burn(tokenId);

        // Refund ETH
        payable(msg.sender).transfer(e.price);
    }

    // CHECK-IN (ROFL CALL)
  
    function markTicketUsed(uint256 tokenId) external onlyVerifier {
        require(_ownerOf(tokenId) != address(0), "Invalid ticket");

        Ticket storage t = tickets[tokenId];
        require(!t.isUsed, "Already used");

        t.isUsed = true;
    }


    function getEvent(uint256 eventId) external view returns (Event memory) {
        return events[eventId];
    }

    function getTicket(uint256 tokenId) external view returns (Ticket memory) {
        return tickets[tokenId];
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