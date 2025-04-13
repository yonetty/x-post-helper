import adapter from '@sveltejs/adapter-static'; // adapter-auto から adapter-static に変更
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		appDir: '_app', // デフォルトの '_app' に戻す
		paths: {
			base: '/x-post-helper' // GitHub Pagesのサブディレクトリ用にベースパスを設定
		},
		// prerender: { default: true }, // このオプションは無効なため削除
		// trailingSlash: 'always', // このオプションは現在のバージョンでは無効なため削除
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see below
			pages: 'build', // 出力ディレクトリ
			assets: 'build', // アセットの出力ディレクトリ
			fallback: 'index.html', // SPAモード用のフォールバックファイルを再度有効化
			precompress: false, // 事前圧縮は無効
			strict: true // エラー時にビルドを失敗させる
		})
	}
};

export default config;
