// 地图相关配置
export const config = {
	url: {
		xyzUrls: [
			'https://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
			'https://webst0{1-4}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}'
			// 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
		] // 天地图加载地址
	},
	center: [104.066939, 30.578673], // 默认中心
	zoom: 10, // 默认缩放等级
	maxZoom: 20, // 最大缩放等级
	minZoom: 5, // 最小缩放等级
	projection: 'EPSG:4326', // 坐标系规则
	extent: [], // 边界值
	allImgs: {
		text: new URL('../../assets/tools/文字.png', import.meta.url).href,
		location: new URL('../../assets/tools/定位.png', import.meta.url).href,
		close: new URL('../../assets/icons/close.png', import.meta.url).href
	} // 相关目标图片
};
