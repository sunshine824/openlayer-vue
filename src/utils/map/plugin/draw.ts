import type { IMap } from '../index';
import { Vector as VectorSource } from 'ol/source.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import { Type as OType } from 'ol/geom/Geometry';
import Draw, {
	DrawEvent,
	GeometryFunction,
	LineCoordType
} from 'ol/interaction/Draw.js';
import Overlay from 'ol/Overlay';
import { SimpleGeometry, Polygon, Circle as GeomCircle, Point } from 'ol/geom';
import { Style, Fill, Stroke, Circle, Icon, Text } from 'ol/style';
import { Options } from 'ol/style/Style';
import { Coordinate } from 'ol/coordinate';

import { uuid } from '@/utils/utils';
import { config } from '../config';
import { Feature } from 'ol';
import { fromLonLat } from 'ol/proj';

export type Type = OType | 'Rectangle' | 'Text';
export type StyleType = 'point' | 'line';
export type ShapeOptions = {
	src?: string;
	text?: string;
	anchor?: [];
	color?: string;
};
export type ShowOptions<T> = {
	id: string;
	coordinate: T;
	[key: string]: any;
};

export default class SDraw {
	private layer;
	private draw!: Draw;
	constructor(
		private readonly map: IMap,
		private source?: VectorSource
	) {
		this.source = source || new VectorSource({ wrapX: false });
		// 创建绘画矢量图层
		this.layer = new VectorLayer({
			className: 'drawLayer',
			source: this.source
		});
		// 将图层添加到Map
		this.map?.addLayer(this.layer);
	}
	// 绘制图形
	drawShape(type: Type, options?: ShapeOptions) {
		return new Promise(resolve => {
			const drawType = type;
			this.draw && this.removeInteraction();
			let maxPoints: number | undefined, geometryFunction!: GeometryFunction;
			if (type == 'Rectangle') {
				maxPoints = 2;
				type = 'LineString';
				geometryFunction = this.rectangleFunction as GeometryFunction;
			}
			type = type == 'Text' ? 'Point' : type;
			this.draw = new Draw({
				type,
				maxPoints,
				source: this.source,
				geometryFunction, //几何信息变更时的回调函数
				style: this.toolStyle(type == 'Point' ? 'point' : 'line', options)
			});
			this.map?.addInteraction(this.draw);
			// 绘制结束触发回调
			this.draw.on('drawend', evt => {
				this.drawEnd(evt, drawType, options, resolve);
			});
		});
	}
	// 更新矩形坐标
	private rectangleFunction(
		coordinates: LineCoordType,
		geometry: SimpleGeometry | undefined
	) {
		geometry = geometry || new Polygon([]); //多边形
		const [start, end] = [...coordinates];
		geometry.setCoordinates([
			[start, [start[0], end[1]], end, [end[0], start[1]], start]
		]);
		return geometry;
	}
	/**
	 * 绘制结束回调
	 * 在这里可以自定义绘制结束后显示效果，比如给每个图形加一个关闭按钮
	 * @param evt
	 */
	private drawEnd(
		evt: DrawEvent,
		type: Type,
		options?: ShapeOptions,
		resolve?: any
	) {
		const feature = evt.feature;
		const geometry: { [key: string]: any } | undefined = feature.getGeometry();
		feature.setId(uuid());

		let position!: Coordinate, popup!: Overlay;
		const resParams: { [key: string]: any } = {};

		if (!['Point', 'Text'].includes(type)) {
			// 创建关闭气泡层
			popup = this.initClosePopup(feature.getId() as string);
			// 设置绘制结束后，显示效果
			feature.setStyle(this.toolStyle('line', options));
		} else {
			// 设置绘制结束后，显示效果
			feature.setStyle(this.toolStyle('point', options));
		}
		switch (type) {
			case 'Circle':
				{
					const coordinate = geometry?.getCenter();
					const radius = geometry?.getRadius();
					position = [
						coordinate[0] + radius * 0.87,
						coordinate[1] + radius * 0.5
					];
					resParams.coordinate = [coordinate, [radius]];
				}
				break;
			case 'Text':
			case 'Point':
				resParams.coordinate = geometry?.getCoordinates();
				break;
			default:
				{
					const coordinate = geometry?.getCoordinates();
					if (type == 'LineString') {
						position = coordinate[0];
					} else {
						position = coordinate[0][3];
					}
					resParams.coordinate = coordinate;
				}
				break;
		}
		this.removeInteraction();
		popup?.setPosition(position);
		// 绘制结束后的回调
		resolve?.({ type, id: feature.getId(), geometry, ...resParams });
	}
	// 初始化关闭气泡层
	private initClosePopup(id: string, position?: number[]) {
		const element = document.createElement('div');
		element.className = 'close-box';
		element.setAttribute('data-id', id);
		element.innerHTML = `<img src="${config.allImgs['close']}"/>`;
		const popup = new Overlay({
			id,
			element,
			position: position || [],
			offset: [0, 0],
			positioning: 'bottom-center'
		});
		this.map?.addOverlay(popup);
		this.bindClosePopupClick(element);
		return popup;
	}
	// 绑定关闭点击事件
	private bindClosePopupClick(elem: HTMLElement) {
		elem.onclick = e => {
			const parentDom = (e.target as Element)?.closest(
				'.close-box'
			) as HTMLElement;
			const id = parentDom?.dataset.id;
			if (id) this.removeFeatureAndPopup(id);
		};
	}
	// 清除feature与对应的popup
	removeFeatureAndPopup(id: string) {
		const feature = this.source?.getFeatureById(id);
		if (feature) {
			this.source?.removeFeature(feature);
			// 获取所有的overlay
			const overlays: Overlay[] | undefined = this.map
				?.getOverlays()
				.getArray();
			overlays?.some((item: any) => {
				if (item.id == id) {
					this.map?.removeOverlay(item);
					return true;
				}
			});
		}
	}
	// 多边形回显
	showPolygon({ id, coordinate, ...args }: ShowOptions<Coordinate[][]>) {
		const feature = new Feature({
			geometry: new Polygon(coordinate)
		});
		feature.setId(id);
		// 设置回显样式
		feature.setStyle(this.toolStyle('line', args.options));
		// 初始化关闭气泡层
		this.initClosePopup(id, coordinate[0][3]);
		// 添加feature
		this.source?.addFeature(feature);
	}
	// 圆形回显
	showCircle({ id, coordinate, ...args }: ShowOptions<Coordinate[]>) {
		const center = coordinate[0];
		const radius = coordinate[1][0];
		const feature = new Feature({
			geometry: new GeomCircle(center, radius)
		});
		feature.setId(id);
		// 设置回显样式
		feature.setStyle(this.toolStyle('line', args.options));
		// 初始化关闭气泡层
		this.initClosePopup(id, [
			center[0] + radius * 0.87,
			center[1] + radius * 0.5
		]);
		// 添加feature
		this.source?.addFeature(feature);
	}
	// 文字回显
	showText({ id, coordinate, ...args }: ShowOptions<Coordinate>) {
		const feature = new Feature({
			geometry: new Point(coordinate)
		});
		feature.setId(id);
		// 设置回显样式
		feature.setStyle(this.toolStyle('point', args.options));
		// 添加feature
		this.source?.addFeature(feature);
	}
	// 工具样式
	private toolStyle(type: StyleType, options: ShapeOptions = {}) {
		let style!: Options;
		const image = new Icon({
			crossOrigin: 'anonymous',
			anchor: options.anchor || [0.5, 0.5],
			scale: 1.2,
			src: options.src || config.allImgs['location']
		});
		const text = options.text
			? new Text({
					font: '15px Microsoft YaHei',
					text: options.text,
					offsetX: 20,
					textAlign: 'left',
					fill: new Fill({
						color: options.color || '#fff'
					})
			  })
			: undefined;
		switch (type) {
			case 'line':
				style = {
					fill: new Fill({
						color: 'rgba(255, 255, 255, 0.2)'
					}),
					stroke: new Stroke({
						width: 2,
						color: '#ec5661'
					}),
					image: new Circle({
						radius: 7,
						fill: new Fill({
							color: '#ec5661'
						})
					})
				};
				break;
			case 'point':
				style = { image, zIndex: 5, text };
				break;
			default:
				break;
		}
		return new Style(style);
	}
	// 清除绘制行为
	removeInteraction() {
		this.draw && this.map?.removeInteraction(this.draw);
	}
	// 清除绘制图层所有图形
	clearSource() {
		this.source?.clear();
	}
}
