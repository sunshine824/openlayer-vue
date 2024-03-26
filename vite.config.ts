import { defineConfig, normalizePath } from 'vite';
import postcssConfig from './postcss.config';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import svgLoader from 'vite-svg-loader';
import viteEslint from 'vite-plugin-eslint';
import viteImagemin from 'vite-plugin-imagemin';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

const variablePath = normalizePath(path.resolve('./src/variable.less'));

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		viteEslint(),
		svgLoader(),
		viteImagemin({
			// 无损压缩配置，无损压缩下图片质量不会变差
			optipng: {
				optimizationLevel: 7
			},
			// 有损压缩配置，有损压缩下图片质量可能会变差
			pngquant: {
				quality: [0.8, 0.9]
			},
			// svg 优化
			svgo: {
				plugins: [
					{
						name: 'removeViewBox'
					},
					{
						name: 'removeEmptyAttrs',
						active: false
					}
				]
			}
		}),
		// 生成svg雪碧图
		createSvgIconsPlugin({
			// 指定需要缓存的图标文件夹
			iconDirs: [path.join(__dirname, '/src/assets/icons')],
			// 指定symbolId格式，就是svg.use使用的href
			symbolId: 'icon-[name]'
		}),
		AutoImport({
			resolvers: [ElementPlusResolver()]
		}),
		Components({
			resolvers: [ElementPlusResolver()]
		})
	],
	server: {
		host: '0.0.0.0'
	},
	json: {
		stringify: true
	},
	resolve: {
		// 别名配置
		alias: {
			'@': path.join(__dirname, 'src'),
			'@assets': path.join(__dirname, 'src/assets')
		}
	},
	build: {
		// 静态资源体积 >=8kb，则打包成单独的文件
		// 如果静态体积 <8kb，则打包成base64字符串内嵌，注：不包含svg
		assetsInlineLimit: 8 * 1024 //8kb
	},
	css: {
		postcss: postcssConfig,
		modules: {
			// css modules 类名生成规则
			generateScopedName: '[local]___[hash:base64:5]'
		},
		preprocessorOptions: {
			less: {
				// additionalData 的内容会在每个 scss 文件的开头自动注入
				additionalData: `@import "${variablePath}";`
			}
		}
	}
});
