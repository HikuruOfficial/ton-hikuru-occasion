import "@stdlib/deploy";


message NewPiggyBank {
    newPiggyBank: Address;
}

message NewOwner {
    newOwner: Address;
}

message NewFees {
    newFees: Int as int64;
}


contract HikuruOccasion with Deployable {
    id: Int as uint32;
    owner: Address;
    piggyBank: Address;
    minCreationFee: Int as int64;  // Fee in nano-tons

    init(id: Int, _piggyBank: Address, initialFee: Int) {
        self.id = id;
        self.owner = sender();
        self.piggyBank = _piggyBank;
        self.minCreationFee = initialFee;
    }

    // accept incoming TON
    receive(){}

    fun onlyOwner(){
        require(sender() == self.owner, "Not owner");
    }


    // change piggy bank
    receive(msg: NewPiggyBank) {
        self.onlyOwner();
        self.piggyBank = msg.newPiggyBank;
    }


    // change owner
    receive(msg: NewOwner) {
        self.onlyOwner();
        self.owner = msg.newOwner;
    }


    receive(msg: NewFees) {
        self.onlyOwner();
        self.minCreationFee = msg.newFees;
    }

    receive("pay creation fees") {
        require(context().value >= self.minCreationFee, "Insufficient fee provided");
        send(SendParameters{
            to: self.piggyBank,
            value: 0,
            bounce: true,
            mode: SendRemainingValue
        });
    }

    receive("withdraw") {
        self.onlyOwner();
        // left on contract 0.05 ton to cover fees
        require(myBalance() - context().value - 50000000 > 0, "Insufficient balance");

        send(SendParameters{
            to: self.owner,
            value: myBalance() - context().value - 50000000,
            bounce: true,
            mode: SendIgnoreErrors + SendRemainingValue
        });
    }


    get fun balance(): Int{
        return myBalance();
    }

    get fun owner(): Address{
        return self.owner;
    }

    get fun piggyBank(): Address {
        return self.piggyBank;
    }

    get fun fees(): Int {
        return self.minCreationFee;
    }
}
