/*
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const { Contract } = require("fabric-contract-api");

class SampleSmartContract008 extends Contract {
    async assetExists008(ctx, deliverableAssetsId) {
        const buffer = await ctx.stub.getState(deliverableAssetsId);
        return !!buffer && buffer.length > 0;
    }

    async createAssets008(ctx, deliverableAssetsId, value) {
        const exists = await this.assetExists008(ctx, deliverableAssetsId);
        if (exists) {
            throw new Error(
                `The deliverable assets ${deliverableAssetsId} already exists`
            );
        }
        const asset = { value };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(deliverableAssetsId, buffer);
    }

    async getAssets008(ctx, deliverableAssetsId) {
        const exists = await this.assetExists008(ctx, deliverableAssetsId);
        if (!exists) {
            throw new Error(
                `The deliverable assets ${deliverableAssetsId} does not exist`
            );
        }
        const buffer = await ctx.stub.getState(deliverableAssetsId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async setAssets008(ctx, deliverableAssetsId, newValue) {
        const exists = await this.assetExists008(ctx, deliverableAssetsId);
        if (!exists) {
            throw new Error(
                `The deliverable assets ${deliverableAssetsId} does not exist`
            );
        }
        const asset = { value: newValue };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(deliverableAssetsId, buffer);
    }

    async deleteAssets008(ctx, deliverableAssetsId) {
        const exists = await this.assetExists008(ctx, deliverableAssetsId);
        if (!exists) {
            throw new Error(
                `The deliverable assets ${deliverableAssetsId} does not exist`
            );
        }
        await ctx.stub.deleteState(deliverableAssetsId);
    }
}

module.exports = SampleSmartContract008;
