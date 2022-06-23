/*
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Contract } = require("fabric-contract-api");
const crypto = require("crypto");

class NotarySmartContract008 extends Contract {
    async assetExists008(ctx, deliverableAssetsId) {
        const buffer = await ctx.stub.getState(deliverableAssetsId);
        return !!buffer && buffer.length > 0;
    }

    async approveOrCancelAgreement008(ctx, deliverableAssetsId, value) {
        const exists = await this.assetExists008(ctx, deliverableAssetsId);

        if (!exists) {
            throw new Error(
                `The agreement ${deliverableAssetsId} does not exist`
            );
        }

        const asset = await this.readAssets008(ctx, deliverableAssetsId); //get asset
        asset.status = value; //change the status to approved
        const buffer = Buffer.from(JSON.stringify(asset)); //stringify it
        await ctx.stub.putState(deliverableAssetsId, buffer); //update it
    }

    async createAssets008(ctx, deliverableAssetsId, value) {
        const exists = await this.assetExists008(ctx, deliverableAssetsId);

        if (exists) {
            throw new Error(
                `The agreement ${deliverableAssetsId} already exists`
            );
        }
        const status = "";
        var hash = crypto.createHash("md5").update(value).digest("hex"); //Hashing with md5
        const asset = { agreement: value, hash, status };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(deliverableAssetsId, buffer);
    }

    async readAssets008(ctx, deliverableAssetsId) {
        const exists = await this.assetExists008(ctx, deliverableAssetsId);
        if (!exists) {
            throw new Error(
                `The agreement ${deliverableAssetsId} does not exist`
            );
        }
        const buffer = await ctx.stub.getState(deliverableAssetsId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async updateAssets008(ctx, deliverableAssetsId, newValue) {
        const exists = await this.assetExists008(ctx, deliverableAssetsId);
        if (!exists) {
            throw new Error(
                `The agreement ${deliverableAssetsId} does not exist`
            );
        }
        var hash = crypto.createHash("md5").update(newValue).digest("hex"); //Hashing with md5
        const status = "";
        const asset = { agreement: newValue, hash, status };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(deliverableAssetsId, buffer);
    }

    async deleteAssets008(ctx, deliverableAssetsId) {
        const exists = await this.assetExists008(ctx, deliverableAssetsId);
        if (!exists) {
            throw new Error(
                `The agreement ${deliverableAssetsId} does not exist`
            );
        }
        await ctx.stub.deleteState(deliverableAssetsId);
    }
}

module.exports = NotarySmartContract008;
