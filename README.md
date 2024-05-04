# Hikuru Occasion Contract

The Hikuru Occasion contract is designed for handling operations related to a virtual piggy bank on the TON blockchain. It allows operations such as changing the owner, modifying the piggy bank address, adjusting creation fees, and handling transactions for payment of fees.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 12.x or higher)
- npm (version 6.x or higher)

## Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/HikuruOfficial/ton-hikuru-occasion.git
cd ton-hikuru-occasion
npm install
```

## Building the Contract

To build the contract, run the following command:

```bash
npx blueprint build
```

This command compiles the contract and prepares it for deployment and testing.

## Testing the Contract

To run tests on the contract, use the following command:

```bash
npx blueprint test
```

This command executes a series of tests defined in the contract's test suite to ensure all functionalities work as expected.

## Contract Functions

- **Deploy**: Initialize the contract with a specific piggy bank address and minimum creation fee.
- **Change Owner**: Allows the current owner to transfer ownership to another address.
- **Change Piggy Bank**: Allows the owner to change the address of the piggy bank where fees are collected.
- **Change Fees**: Allows the owner to set a new minimum creation fee.
- **Pay Creation Fees**: Allows users to pay fees, which are then sent to the piggy bank.
- **Withdraw**: Allows the owner to withdraw funds from the contract.

## Common Issues

- **Insufficient Fees**: If the transaction value is less than the set minimum creation fee, the transaction will be rejected.
- **Unauthorized Changes**: Only the current owner can change critical settings like fees or the piggy bank address.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or create issues for bugs and feature requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE) file for details.
