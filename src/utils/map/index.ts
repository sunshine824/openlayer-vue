import { config } from './config';

import Map, { MapOptions } from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import XYZ from 'ol/source/XYZ.js';
import {
	defaults as Defaults,
	MousePosition,
	ScaleLine,
	ZoomSlider,
	FullScreen
} from 'ol/control';

export type IMap = Map | null;

class SMap {
	map: IMap = null;
	constructor(opts: MapOptions) {
		this.init(opts);
	}
	private init(opts: MapOptions) {
		this.map = new Map(opts);
	}
	getMap() {
		return this.map;
	}
}

export const smap = (opts: MapOptions) => {
	const layers =
		opts.layers ||
		config.url.xyzUrls.map(url => {
			return new TileLayer({
				visible: true,
				source: new XYZ({ url })
			});
		});
	const controls =
		opts.controls ||
		Defaults({ zoom: true }).extend([
			new ScaleLine(), //比例尺控件
			new ZoomSlider(), //缩放滑块刻度控件
			new FullScreen(), // 全屏控件
			new MousePosition({
				coordinateFormat: function (coordinate) {
					return `东经${coordinate?.[0]} 北纬${coordinate?.[1]}`;
				}
			}) //鼠标位置控件
		]);

	return new SMap(
		Object.assign(
			{
				layers,
				controls,
				target: opts.target,
				view:
					opts.view ||
					new View({
						projection: config.projection,
						center: config.center,
						zoom: config.zoom,
						maxZoom: config.maxZoom,
						minZoom: config.minZoom
					})
			},
			opts
		)
	);
};

// 开放扩展入口
smap.extend = (plugin: any, option?: any) => {
	if (!plugin.has) {
		// install plugin only once
		plugin(SMap, option, smap);
		plugin.has = true;
	}
	return smap;
};

smap.prototype = SMap.prototype;

export { default as sdraw } from './plugin/draw';

export type { Type, ShapeOptions } from './plugin/draw';
