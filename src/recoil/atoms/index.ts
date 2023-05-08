import {atom, RecoilState} from "recoil";

import {TMenu, TScanTarget} from "@appTypes/app.zod";
import {ScanIds} from "@appTypes/props.type";
import {ScanTarget} from "@constants";

export const atomSidebarOpen = atom({
	key: "atomSidebar",
	default: true,
});

export const atomMenuIconKey = atom({
	key: "atomMenuIconKey",
	default: "",
});

export const atomMappedMenu = atom<TMenu[]>({
	key: "atomMappedMenu",
	default: [],
});

export const atomMenuChangeOrder = atom({
	key: "atomMenuChangeOrder",
	default: false,
});

export const atomExcludedItem = atom<string[]>({
	key: "atomExcludedItem",
	default: [],
});

export const atomIncludedItem = atom<string[]>({
	key: "atomIncludedItem",
	default: [],
});

export const atomUidScan = new Map<
	TScanTarget | undefined,
	RecoilState<ScanIds[]>
>(
	[undefined, ...ScanTarget].map(target => [
		target,
		atom<ScanIds[]>({
			key: `atomUidScan-${target}`,
			default: [],
		}),
	]),
);
