/*
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { ChaincodeStub, ClientIdentity } = require("fabric-shim");
const { DeliverableAssetsContract } = require("..");
const winston = require("winston");

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {
    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logger = {
            getLogger: sinon
                .stub()
                .returns(
                    sinon.createStubInstance(winston.createLogger().constructor)
                ),
            setLevel: sinon.stub(),
        };
    }
}

describe("DeliverableAssetsContract", () => {
    let contract;
    let ctx;

    beforeEach(() => {
        contract = new DeliverableAssetsContract();
        ctx = new TestContext();
        ctx.stub.getState
            .withArgs("1001")
            .resolves(Buffer.from('{"value":"deliverable assets 1001 value"}'));
        ctx.stub.getState
            .withArgs("1002")
            .resolves(Buffer.from('{"value":"deliverable assets 1002 value"}'));
    });

    describe("#deliverableAssetsExists", () => {
        it("should return true for a deliverable assets", async () => {
            await contract.deliverableAssetsExists(ctx, "1001").should
                .eventually.be.true;
        });

        it("should return false for a deliverable assets that does not exist", async () => {
            await contract.deliverableAssetsExists(ctx, "1003").should
                .eventually.be.false;
        });
    });

    describe("#createDeliverableAssets", () => {
        it("should create a deliverable assets", async () => {
            await contract.createDeliverableAssets(
                ctx,
                "1003",
                "deliverable assets 1003 value"
            );
            ctx.stub.putState.should.have.been.calledOnceWithExactly(
                "1003",
                Buffer.from('{"value":"deliverable assets 1003 value"}')
            );
        });

        it("should throw an error for a deliverable assets that already exists", async () => {
            await contract
                .createDeliverableAssets(ctx, "1001", "myvalue")
                .should.be.rejectedWith(
                    /The deliverable assets 1001 already exists/
                );
        });
    });

    describe("#readDeliverableAssets", () => {
        it("should return a deliverable assets", async () => {
            await contract
                .readDeliverableAssets(ctx, "1001")
                .should.eventually.deep.equal({
                    value: "deliverable assets 1001 value",
                });
        });

        it("should throw an error for a deliverable assets that does not exist", async () => {
            await contract
                .readDeliverableAssets(ctx, "1003")
                .should.be.rejectedWith(
                    /The deliverable assets 1003 does not exist/
                );
        });
    });

    describe("#updateDeliverableAssets", () => {
        it("should update a deliverable assets", async () => {
            await contract.updateDeliverableAssets(
                ctx,
                "1001",
                "deliverable assets 1001 new value"
            );
            ctx.stub.putState.should.have.been.calledOnceWithExactly(
                "1001",
                Buffer.from('{"value":"deliverable assets 1001 new value"}')
            );
        });

        it("should throw an error for a deliverable assets that does not exist", async () => {
            await contract
                .updateDeliverableAssets(
                    ctx,
                    "1003",
                    "deliverable assets 1003 new value"
                )
                .should.be.rejectedWith(
                    /The deliverable assets 1003 does not exist/
                );
        });
    });

    describe("#deleteDeliverableAssets", () => {
        it("should delete a deliverable assets", async () => {
            await contract.deleteDeliverableAssets(ctx, "1001");
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly("1001");
        });

        it("should throw an error for a deliverable assets that does not exist", async () => {
            await contract
                .deleteDeliverableAssets(ctx, "1003")
                .should.be.rejectedWith(
                    /The deliverable assets 1003 does not exist/
                );
        });
    });
});
