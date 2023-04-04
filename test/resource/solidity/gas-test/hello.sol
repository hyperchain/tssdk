pragma solidity ^0.8.19;

contract HelloWeb3 {
    uint256 public number = 5;

    function add() external {
        number = number + 1;
    }

    function addPure(uint256 _number) external pure returns(uint256 new_number){
        new_number = _number + 1;
    }

    // gasUsed: 36613 // gasUsed: 608249
    function addView() external view returns(uint256 new_number) {
      new_number = 0;
      for (uint i = 0; i < 1000; i ++) {
        new_number += number;
      }
      return new_number;
    }

    function minus() internal {
        number = number - 1;
    }

    function minusCall() payable external {
        minus();
    }

    function minusPayable() external payable returns(uint256) {
        minus();
        return address(this).balance;
    }
}
