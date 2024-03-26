<template>
	<div class="map-area">
		<div id="map-box" class="map-container"></div>
		<div class="map-tools">
			<el-dropdown
				style="width: 100px; margin-right: 15px"
				@command="drawShape"
			>
				<el-button type="primary" style="width: 100%">
					绘制
					<el-icon class="el-icon--right"><arrow-down /></el-icon>
				</el-button>
				<template #dropdown>
					<el-dropdown-menu>
						<el-dropdown-item command="Rectangle">矩形</el-dropdown-item>
						<el-dropdown-item command="Circle">圆形</el-dropdown-item>
						<el-dropdown-item command="Polygon">多边形</el-dropdown-item>
						<el-dropdown-item command="Point">定位</el-dropdown-item>
						<el-dropdown-item command="LineString">线段</el-dropdown-item>
					</el-dropdown-menu>
				</template>
			</el-dropdown>
			<el-dropdown style="width: 100px">
				<el-button type="primary" style="width: 100%">
					工具
					<el-icon class="el-icon--right"><arrow-down /></el-icon>
				</el-button>
				<template #dropdown>
					<el-dropdown-menu>
						<el-dropdown-item>归心</el-dropdown-item>
						<el-dropdown-item>测距</el-dropdown-item>
						<el-dropdown-item>测面</el-dropdown-item>
					</el-dropdown-menu>
				</template>
			</el-dropdown>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref } from 'vue';
import type { IMap, Type, ShapeOptions } from '@/utils/map';
import { smap, sdraw } from '@/utils/map';
import { ArrowDown } from '@element-plus/icons-vue';

import { defaults } from 'ol/interaction';
import { config } from '@/utils/map/config';
import { uuid } from '@/utils/utils';

const map: Ref<IMap> = ref(null);
const drawInstance: Ref<sdraw | null> = ref(null);

onMounted(() => {
	const mapInstance = smap({
		target: 'map-box',
		interactions: defaults({ doubleClickZoom: false }) // 禁止双击放大行为
	});
	map['value'] = mapInstance.getMap();
	// 绘制实例化
	drawInstance['value'] = new sdraw(map['value']);

	drawInstance['value'].showText({
		id: uuid(),
		coordinate: [104.060774, 30.572243],
		options: {
			text: '四川省成都市武侯区孵化园9号楼F座2楼5号',
			src: config.allImgs['location']
		}
	});
});

const drawShape = async (command: Type) => {
	let options!: ShapeOptions;
	switch (command) {
		case 'Text':
			options = { src: config.allImgs['text'] };
			break;
		default:
			break;
	}
	const res = await drawInstance['value']?.drawShape(command, options);
	console.log(res);
};
</script>

<style scoped lang="less">
.map-area {
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	:deep(.close-box) {
		padding: 1px 4px;
		border-radius: 3px;
		background: #545353;
		cursor: pointer;
		img {
			width: 15px;
			height: 15px;
		}
	}
	.map-container {
		width: 100%;
		height: 100%;
	}
	.map-tools {
		position: absolute;
		right: 40px;
		top: 7px;
	}
}
</style>
