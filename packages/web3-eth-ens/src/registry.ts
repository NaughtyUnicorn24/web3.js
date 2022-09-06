﻿/*
This file is part of web3.js.

web3.js is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

web3.js is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/

import { Contract, NonPayableCallOptions } from 'web3-eth-contract';
import { DataFormat, DEFAULT_RETURN_FORMAT, format, isHexStrict, sha3Raw } from 'web3-utils';
import { Address } from 'web3-types';
import { Web3ContextObject } from 'web3-core';
import { ENSRegistryAbi } from './abi/ens/ENSRegistry';
import { PublicResolverAbi } from './abi/ens/PublicResolver';
import { registryAddresses } from './config';
import { namehash } from './utils';

export class Registry {
	private readonly contract: Contract<typeof ENSRegistryAbi>;
	private readonly context: Web3ContextObject;

	public constructor(context: Web3ContextObject, customRegistryAddress?: Address) {
		this.contract = new Contract(
			ENSRegistryAbi,
			customRegistryAddress ?? registryAddresses.main,
			context,
		);

		this.context = context;
	}
	public async getOwner(name: string) {
		const result = this.contract.methods.owner(namehash(name)).call();

		return result;
	}

	public setOwner(
		name: string,
		address: Address,
		txConfig: NonPayableCallOptions, // TODO: web3-eth txconfig should be replaced with sendTransaction type
		returnFormat: DataFormat = DEFAULT_RETURN_FORMAT,
	) {
		const receipt = this.contract.methods
			.setOwner(namehash(name), format({ eth: 'address' }, address, returnFormat))
			.send(txConfig);

		return receipt;
	}

	public async getTTL(name: string) {
		return this.contract.methods.ttl(namehash(name)).call();
	}

	public setTTL(
		name: string,
		ttl: number,
		txConfig: NonPayableCallOptions, // TODO: web3-eth txconfig should be replaced with sendTransaction type
	) {
		const promiEvent = this.contract.methods.setTTL(namehash(name), ttl).send(txConfig);

		return promiEvent;
	}

	public setSubnodeOwner(
		node: string,
		label: string,
		address: Address,
		txConfig: NonPayableCallOptions, // TODO: web3-eth txconfig should be replaced with sendTransaction type
		returnFormat: DataFormat = DEFAULT_RETURN_FORMAT,
	) {
		const hexStrictLabel = !isHexStrict(label) ? sha3Raw(label) : label;
		const receipt = this.contract.methods
			.setSubnodeOwner(
				namehash(node),
				hexStrictLabel,
				format({ eth: 'address' }, address, returnFormat),
			)
			.send(txConfig);
		return receipt;
	}

	public setSubnodeRecord(
		name: string,
		label: string,
		owner: Address,
		resolver: Address,
		ttl: number,
		txConfig: NonPayableCallOptions, // TODO: web3-eth txconfig should be replaced with sendTransaction type
		returnFormat: DataFormat = DEFAULT_RETURN_FORMAT,
	) {
		const hexStrictLabel = !isHexStrict(label) ? sha3Raw(label) : label;
		const receipt = this.contract.methods
			.setSubnodeRecord(
				namehash(name),
				hexStrictLabel,
				format({ eth: 'address' }, owner, returnFormat),
				format({ eth: 'address' }, resolver, returnFormat),
				ttl,
			)
			.send(txConfig);
		return receipt;
	}

	public setApprovalForAll(
		operator: string,
		approved: boolean,
		txConfig: NonPayableCallOptions, // TODO: web3-eth txconfig should be replaced with sendTransaction type
	) {
		const receipt = this.contract.methods.setApprovalForAll(operator, approved).send(txConfig);

		return receipt;
	}

	public async isApprovedForAll(
		owner: Address,
		operator: Address,
		returnFormat: DataFormat = DEFAULT_RETURN_FORMAT,
	) {
		const result = this.contract.methods
			.isApprovedForAll(
				format({ eth: 'address' }, owner, returnFormat),
				format({ eth: 'address' }, operator, returnFormat),
			)
			.call();

		return result;
	}

	public async recordExists(name: string) {
		const promise = this.contract.methods.recordExists(namehash(name)).call();

		return promise;
	}

	public async getResolver(name: string) {
		return this.contract.methods
			.resolver(namehash(name))
			.call()
			.then(address => {
				// address type is unknown, not sure why
				if (typeof address === 'string') {
					const contract = new Contract(PublicResolverAbi, address, this.context);
					// TODO: set contract provider needs to be added when ens current provider
					return contract;
				}
				throw new Error();
			});
	}

	public setResolver(
		name: string,
		address: Address,
		txConfig: NonPayableCallOptions, // TODO: web3-eth txconfig should be replaced with sendTransaction type
		returnFormat: DataFormat = DEFAULT_RETURN_FORMAT,
	) {
		return this.contract.methods
			.setResolver(namehash(name), format({ eth: 'address' }, address, returnFormat))
			.send(txConfig);
	}

	public setRecord(
		name: string,
		owner: Address,
		resolver: Address,
		ttl: number,
		txConfig: NonPayableCallOptions,
		returnFormat: DataFormat = DEFAULT_RETURN_FORMAT,
	) {
		return this.contract.methods
			.setRecord(
				namehash(name),
				format({ eth: 'address' }, owner, returnFormat),
				format({ eth: 'address' }, resolver, returnFormat),
				ttl,
			)
			.send(txConfig);
	}
}