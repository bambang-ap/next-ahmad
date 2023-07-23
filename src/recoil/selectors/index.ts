import {DefaultValue, RecoilState, selector} from "recoil";

import {TScanTarget} from "@appTypes/app.type";
import {ScanIds} from "@appTypes/props.type";
import {ScanTarget} from "@constants";
import {atomUidScan} from "@recoil/atoms";

// @ts-ignore
export const selectorScanIds = new Map<
	TScanTarget | undefined,
	RecoilState<ScanIds[]>
>(
	[undefined, ...ScanTarget].map(target => [
		target,
		selector({
			key: `selectorScanIds-${target}`,
			get: ({get}) => get(atomUidScan.get(target)!),
			set({set}, values) {
				if (values instanceof DefaultValue) return;
				set(atomUidScan.get(target)!, values);
			},
		}),
	]),
);
