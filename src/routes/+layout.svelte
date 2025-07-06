<script>
	import { browser } from '$app/environment';
	import { page } from '$app/stores';

	// Google Analytics initialization
	// 環境変数を条件付きでインポート（ビルド時のエラーを回避）
	let GA_MEASUREMENT_ID = '';
	
	if (browser) {
		// クライアントサイドでのみ環境変数にアクセス
		GA_MEASUREMENT_ID = import.meta.env.PUBLIC_GA_MEASUREMENT_ID || '';
	}
	
	if (browser && GA_MEASUREMENT_ID) {
		// Load gtag.js script
		const script = document.createElement('script');
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
		document.head.appendChild(script);

		// Initialize dataLayer and gtag
		window.dataLayer = window.dataLayer || [];
		function gtag() {
			window.dataLayer.push(arguments);
		}
		window.gtag = gtag;

		gtag('js', new Date());
		gtag('config', GA_MEASUREMENT_ID);

		// Track page views on navigation
		page.subscribe(($page) => {
			if (typeof gtag !== 'undefined') {
				gtag('config', GA_MEASUREMENT_ID, {
					page_path: $page.url.pathname
				});
			}
		});
	}
</script>

<slot />