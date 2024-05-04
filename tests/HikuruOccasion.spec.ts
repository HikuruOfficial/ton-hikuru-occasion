import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { HikuruOccasion } from '../wrappers/HikuruOccasion';
import '@ton/test-utils';

describe('HikuruOccasion', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let hikuruOccasion: SandboxContract<HikuruOccasion>;
    let piggyBank: SandboxContract<TreasuryContract>;
    let user: SandboxContract<TreasuryContract>;
    let sendTon;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        piggyBank = await blockchain.treasury('piggyBank');
        user = await blockchain.treasury('user');



        hikuruOccasion = blockchain.openContract(await HikuruOccasion.fromInit(0n, piggyBank.address, toNano('1')));

        const deployResult = await hikuruOccasion.send(
            deployer.getSender(),
            {
                value: toNano('1'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: hikuruOccasion.address,
            deploy: true,
            success: true,
        });


    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and hikuruOccasion are ready to use
    });

    it("Deployment and Initial State", async()=>{
        const ownerInContract = await hikuruOccasion.getOwner();
        const feesForCreation = await hikuruOccasion.getFees();

        expect(ownerInContract).toEqualAddress(deployer.address);
        expect(feesForCreation).toEqual(toNano('1'));
    })




    it("Should reject fee payments that do not meet the minimum requirement", async () => {
        const insufficientPaymentAmount = toNano('0.5'); // Less than the minimum creation fee
        const paymentResult = await hikuruOccasion.send(
            user.getSender(),
            {
                value: insufficientPaymentAmount,
            },
            'pay creation fees'
        );

        expect(paymentResult.transactions).toHaveTransaction({
            from: user.address,
            to: hikuruOccasion.address,
            value: insufficientPaymentAmount,
            success: false,
        });
    });

    it("Should accept fee payments that meet the minimum requirement", async () => {
        const piggyBankBalanceBefore = await piggyBank.getBalance();

        const sufficientPaymentAmount = toNano('1'); // Equal to the minimum creation fee
        const paymentResult = await hikuruOccasion.send(
            user.getSender(),
            {
                value: toNano('1.05'),
            },
            'pay creation fees'
        );

        expect(paymentResult.transactions).toHaveTransaction({
            from: user.address,
            to: hikuruOccasion.address,
            value: toNano('1.05'),
            success: true,
        });


        // check if the piggy bank received the fees
        const piggyBankBalance = await piggyBank.getBalance();
        expect(piggyBankBalance).toBeGreaterThanOrEqual(piggyBankBalanceBefore + sufficientPaymentAmount);
    });


    

    it("Should be able to change owner", async()=>{
        const newOwner = await blockchain.treasury('newOwner');
        const changeOwnerResult = await hikuruOccasion.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'NewOwner',
                newOwner: newOwner.address
            }
        );

        expect(changeOwnerResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: hikuruOccasion.address,
            deploy: false,
            success: true,
        });

        const ownerInContract = await hikuruOccasion.getOwner();
        expect(ownerInContract).toEqualAddress(newOwner.address);
    });

    it("Should be able to change fees", async()=>{
        const newFees = toNano('2');
        const changeFeesResult = await hikuruOccasion.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'NewFees',
                newFees: newFees
            }
        );

        expect(changeFeesResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: hikuruOccasion.address,
            deploy: false,
            success: true,
        });

        const feesInContract = await hikuruOccasion.getFees();
        expect(feesInContract).toEqual(newFees);



    });


    // check is only owner can change owner
    it("Should not be able to change owner if not owner", async()=>{
        const ownerBefore = await hikuruOccasion.getOwner();
        const newOwner = await blockchain.treasury('newOwner');
        const changeOwnerResult = await hikuruOccasion.send(
            user.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'NewOwner',
                newOwner: newOwner.address
            }
        );

        expect(changeOwnerResult.transactions).toHaveTransaction({
            from: user.address,
            to: hikuruOccasion.address,
            deploy: false,
            success: false,
        });

        const ownerInContract = await hikuruOccasion.getOwner();
        expect(ownerInContract).toEqualAddress(ownerBefore);
    });
    // check is only owner can change fees
    it("Should not be able to change fees if not owner", async()=>{
        const feeBefore = await hikuruOccasion.getFees();

        const newFees = toNano('2');
        const changeFeesResult = await hikuruOccasion.send(
            user.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'NewFees',
                newFees: newFees
            }
        );

        expect(changeFeesResult.transactions).toHaveTransaction({
            from: user.address,
            to: hikuruOccasion.address,
            deploy: false,
            success: false,
        });

        const feesInContract = await hikuruOccasion.getFees();
        expect(feesInContract).toEqual(feeBefore);
    });


    // change piggy bank and only owner can change piggy bank
    it("Should be able to change piggy bank", async()=>{
        const newPiggyBank = await blockchain.treasury('newPiggyBank');
        const changePiggyBankResult = await hikuruOccasion.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'NewPiggyBank',
                newPiggyBank: newPiggyBank.address
            }
        );

        expect(changePiggyBankResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: hikuruOccasion.address,
            deploy: false,
            success: true,
        });

        const piggyBankInContract = await hikuruOccasion.getPiggyBank();
        expect(piggyBankInContract).toEqualAddress(newPiggyBank.address);
    });

    it("Should not be able to change piggy bank if not owner", async()=>{
        const piggyBankBefore = await hikuruOccasion.getPiggyBank();
        const newPiggyBank = await blockchain.treasury('newPiggyBank');
        const changePiggyBankResult = await hikuruOccasion.send(
            user.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'NewPiggyBank',
                newPiggyBank: newPiggyBank.address
            }
        );

        expect(changePiggyBankResult.transactions).toHaveTransaction({
            from: user.address,
            to: hikuruOccasion.address,
            deploy: false,
            success: false,
        });

        const piggyBankInContract = await hikuruOccasion.getPiggyBank();
        expect(piggyBankInContract).toEqualAddress(piggyBankBefore);
    });




}
);
