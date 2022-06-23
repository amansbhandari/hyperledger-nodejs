/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class DeliverableAssetsContract extends Contract {

    async deliverableAssetsExists(ctx, deliverableAssetsId) {
        const buffer = await ctx.stub.getState(deliverableAssetsId);
        return (!!buffer && buffer.length > 0);
    }

    async createDeliverableAssets(ctx, deliverableAssetsId, value) {
        const exists = await this.deliverableAssetsExists(ctx, deliverableAssetsId);
        if (exists) {
            throw new Error(`The deliverable assets ${deliverableAssetsId} already exists`);
        }
        const asset = { value };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(deliverableAssetsId, buffer);
    }

    async readDeliverableAssets(ctx, deliverableAssetsId) {
        const exists = await this.deliverableAssetsExists(ctx, deliverableAssetsId);
        if (!exists) {
            throw new Error(`The deliverable assets ${deliverableAssetsId} does not exist`);
        }
        const buffer = await ctx.stub.getState(deliverableAssetsId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async updateDeliverableAssets(ctx, deliverableAssetsId, newValue) {
        const exists = await this.deliverableAssetsExists(ctx, deliverableAssetsId);
        if (!exists) {
            throw new Error(`The deliverable assets ${deliverableAssetsId} does not exist`);
        }
        const asset = { value: newValue };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(deliverableAssetsId, buffer);
    }

    async deleteDeliverableAssets(ctx, deliverableAssetsId) {
        const exists = await this.deliverableAssetsExists(ctx, deliverableAssetsId);
        if (!exists) {
            throw new Error(`The deliverable assets ${deliverableAssetsId} does not exist`);
        }
        await ctx.stub.deleteState(deliverableAssetsId);
    }

}

module.exports = DeliverableAssetsContract;
