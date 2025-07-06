<script lang="ts">
	import type { PageData } from './$types'; // PageData を再度インポート
	import type { EventData } from '$lib/types'; // EventData 型をインポート
	// onMount, page, base は不要

	// +page.server.ts から渡されるデータを受け取る
	export let data: PageData;
	// eventData は data プロパティ経由で渡されるため、リアクティブに扱う
	$: eventData = data.eventData as EventData; // dataが変更されたらeventDataも更新
	// isLoading, errorMessage は不要

	let selectedTrackIndex: number | null = null; // 選択されたトラックのインデックスを保持 (nullは未選択)
	let tweetContent = '';
	// hashtagsPreview と tweetPreviewHtml はリアクティブに計算するため、初期値は安全なデフォルトを設定
	let hashtagsPreview = '';
	let tweetPreviewHtml = '<p><em>ここに投稿プレビューが表示されます...</em></p>';

	// --- Helper Function ---
	// XSS対策のため、ユーザー入力をエスケープするヘルパー関数（簡易版）
	const escapeHtml = (unsafe: string): string => {
		// 型ガードを追加
		if (typeof unsafe !== 'string') {
			return '';
		}
		// HTMLエンティティへの置換順序に注意 (& を最初に)
		return unsafe
			.replace(/&/g, '&amp;') // & -> &
			.replace(/</g, '&lt;') // < -> <
			.replace(/>/g, '&gt;') // > -> >
			.replace(/"/g, '&quot;') // " -> "
			.replace(/'/g, '&#039;'); // ' -> &#039;
	};

	// --- リアクティブな更新 ---

	// ファビコン用SVGデータURLを生成 (eventDataが存在するか確認)
	$: faviconHref = eventData?.iconEmoji
		? `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${encodeURIComponent(eventData.iconEmoji)}</text></svg>` // 絵文字をエンコード
		: '';

	// 選択されたトラックに基づいてハッシュタグを更新 (eventDataが存在するか確認)
	$: {
		const baseHashtag = eventData?.mainHashtag || '';
		let currentHashtags = [baseHashtag];
		// selectedTrackIndex が null でなく、有効なインデックスの場合
		if (selectedTrackIndex !== null && eventData?.tracks?.[selectedTrackIndex]) {
			// 配列から選択されたトラックオブジェクトを取得し、その hashtag プロパティを追加
			currentHashtags.push(eventData.tracks[selectedTrackIndex].hashtag);
		}
		// 各ハッシュタグの前に # がなければ付与し、空のものは除外
		hashtagsPreview = currentHashtags
			.filter((h) => h) // 空の文字列を除外
			.map((h) => (h.startsWith('#') ? h : `#${h}`)) // # がなければ付与
			.join(' ');
	}

	// 投稿内容やハッシュタグが変わったらプレビューを更新
	$: {
		if (tweetContent || hashtagsPreview) {
			// コンテンツかハッシュタグがあればプレビュー更新
			// hashtagsPreview には既に # が付いているのでエスケープのみ
			const escapedHashtags = escapeHtml(hashtagsPreview);
			// テキストとハッシュタグを空白1文字で区切って1つのpタグ内に表示
			if (tweetContent) {
				tweetPreviewHtml = `<p>${escapeHtml(tweetContent)} ${escapedHashtags}</p>`;
			} else {
				tweetPreviewHtml = `<p>${escapedHashtags}</p>`;
			}
		} else {
			tweetPreviewHtml = '<p><em>ここに投稿プレビューが表示されます...</em></p>';
		}
	}

	// --- イベントハンドラ ---

	function selectTrack(index: number | null) {
		// 引数をインデックスに変更 (null許容)
		selectedTrackIndex = index;
	}

	function clearContent() {
		tweetContent = '';
		// プレビューはリアクティブに更新される
	}

	async function copyHashtags() {
		try {
			await navigator.clipboard.writeText(hashtagsPreview);
			alert('ハッシュタグをコピーしました！');
		} catch (err) {
			console.error('コピーに失敗しました:', err);
			alert('コピーに失敗しました。手動でコピーしてください。');
		}
	}

	function postToX() {
		const tweetText = encodeURIComponent(`${tweetContent} ${hashtagsPreview}`);
		window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
	}
</script>

<svelte:head>
	<title>{eventData?.eventName || 'X投稿ヘルパー'} - X投稿ヘルパー</title>
	<!-- eventDataが未定義の場合のフォールバック -->
	{#if faviconHref}
		<link rel="icon" href={faviconHref} />
	{/if}
</svelte:head>

<!-- isLoading, errorMessage の分岐は不要 -->
{#if eventData}
	<!-- eventDataがロードされるまでコンテンツを表示しない -->
	<div class="container">
		<h1>
			{eventData.eventName}
			{#if eventData.iconEmoji}
				<span class="title-icon">{eventData.iconEmoji}</span>
			{/if}
		</h1>

		<fieldset>
			<legend>参加中のトラック (選択してください):</legend>
			<div class="track-panels">
				<button
					type="button"
					class="track-panel no-track"
					class:selected={selectedTrackIndex === null}
					on:click={() => selectTrack(null)}
				>
					トラック指定なし
				</button>
				{#each eventData.tracks as track, i (i)}
					<!-- 配列をループし、インデックスをキーにする -->
					<button
						type="button"
						class="track-panel"
						class:selected={selectedTrackIndex === i}
						on:click={() => selectTrack(i)}
					>
						{track.name}
						<!-- trackオブジェクトのnameプロパティを表示 -->
					</button>
				{/each}
			</div>
		</fieldset>

		<div>
			<label for="tweetContent">投稿内容:</label>
			<textarea
				id="tweetContent"
				placeholder="イベントについてのコメントをここに入力..."
				bind:value={tweetContent}
			></textarea>
			<div style="text-align: right; margin-top: 5px; margin-bottom: 15px;">
				<button class="small-button" on:click={clearContent}>クリア</button>
			</div>
		</div>

		<!-- 不要なハッシュタグ表示欄を削除 -->

		<div class="tweet-preview">
			{@html tweetPreviewHtml}
		</div>

		<div class="button-group">
			<button class="secondary-button" on:click={copyHashtags}>ハッシュタグをコピー</button>
			<button on:click={postToX}>Xで投稿する</button>
		</div>
	</div>

	<footer>
		<p>
			© 2025 X投稿ヘルパー | <a href="https://github.com/yonetty/x-post-helper" target="_blank"
				>GitHub</a
			>
		</p>
		<p class="footer-info">
			他のイベント用のX投稿ヘルパーサイトをご希望の場合は、
			<a href="https://forms.gle/Q3k3ykvMeTthqbCD9" target="_blank">こちらのフォーム</a
			>よりお申し込みください。
		</p>
	</footer>
{:else}
	<!-- データがない場合の表示（通常は発生しないはず） -->
	<p>イベントデータが見つかりません。</p>
{/if}

<style>
	/* エラーメッセージ用のスタイルは削除 */
	/* 元のHTMLからスタイルをコピー */
	:global(body) {
		/* グローバルスタイルとして適用 */
		font-family: 'Helvetica Neue', Arial, sans-serif;
		line-height: 1.6;
		color: #333;
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
		background-color: #f5f8fa;
	}
	h1 {
		color: #1da1f2;
		text-align: center;
		margin-bottom: 30px;
	}
	.container {
		background-color: white;
		border-radius: 15px;
		padding: 25px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		/* コンポーネント内なのでposition: relativeを追加してクリアボタンの基準にする */
		position: relative;
	}
	/* fieldsetのデフォルトスタイルをリセット */
	fieldset {
		border: none;
		padding: 0;
		margin: 0;
		margin-bottom: 20px; /* 元のdivのmarginを適用 */
	}
	legend {
		display: block;
		margin-bottom: 8px;
		font-weight: bold;
		padding: 0; /* legendのデフォルトpaddingをリセット */
	}
	.track-panels {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-bottom: 20px;
	}
	.track-panel {
		flex: 1 0 120px;
		text-align: center;
		padding: 15px 10px;
		border: 2px solid #ddd;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.3s ease;
		/* buttonのデフォルトスタイルをリセット */
		background: none;
		border: 2px solid #ddd; /* 元のスタイルを維持 */
		padding: 15px 10px; /* 元のスタイルを維持 */
		margin: 0;
		font: inherit;
		color: inherit;
		text-align: center; /* 元のスタイルを維持 */
		flex: 1 0 120px; /* 元のスタイルを維持 */
		border-radius: 10px; /* 元のスタイルを維持 */
	}
	.track-panel:hover {
		background-color: #f0f7ff;
		border-color: #1da1f2;
	}
	.track-panel.selected {
		background-color: #e8f5fd;
		border-color: #1da1f2;
		font-weight: bold;
	}
	.track-panel.no-track {
		background-color: #f0f0f0;
		border-style: dashed;
	}
	label {
		display: block;
		margin-bottom: 8px;
		font-weight: bold;
	}
	textarea {
		width: 100%;
		padding: 12px;
		border: 1px solid #ddd;
		border-radius: 5px;
		font-size: 16px;
		margin-bottom: 15px;
		resize: vertical;
		min-height: 100px;
		box-sizing: border-box; /* paddingを含めた幅計算 */
	}
	.button-group {
		display: flex;
		justify-content: space-between;
		margin-top: 20px;
	}
	button {
		background-color: #1da1f2;
		color: white;
		border: none;
		padding: 12px 20px;
		border-radius: 50px;
		font-size: 16px;
		font-weight: bold;
		cursor: pointer;
		transition: background-color 0.3s;
	}
	button:hover {
		background-color: #0c85d0;
	}
	.secondary-button {
		background-color: #657786;
	}
	.secondary-button:hover {
		background-color: #48545d;
	}
	.tweet-preview {
		margin-top: 20px;
		padding: 15px;
		border: 1px solid #ddd;
		border-radius: 5px;
		background-color: white;
		min-height: 50px; /* プレビューエリアの最小高さを確保 */
		word-wrap: break-word; /* 長い単語の折り返し */
	}
	footer {
		margin-top: 30px;
		text-align: center;
		font-size: 14px;
		color: #657786;
	}
	.footer-info {
		margin-top: 10px;
		font-size: 13px;
		line-height: 1.4;
	}
	.footer-info a {
		color: #1da1f2;
		text-decoration: none;
	}
	.footer-info a:hover {
		text-decoration: underline;
	}
	/* クリアボタンのスタイルを調整 */
	.small-button {
		background-color: #e0e0e0;
		color: #666;
		padding: 5px 10px;
		border-radius: 4px;
		font-size: 12px;
		border: none;
		cursor: pointer;
		font-weight: normal; /* 太字解除 */
	}
	.small-button:hover {
		background-color: #d0d0d0;
	}
	@media (max-width: 600px) {
		.track-panels {
			flex-direction: column;
		}
		.track-panel {
			flex: none;
		}
		.button-group {
			flex-direction: column;
			gap: 10px;
		}
		button {
			width: 100%;
		}
	}
	/* タイトル横のアイコン用スタイル */
	.title-icon {
		margin-left: 0.25em; /* 絵文字とテキストの間に少しスペースを追加 */
		font-size: 1em; /* h1のフォントサイズに合わせる */
		vertical-align: baseline; /* h1のテキストとベースラインを合わせる */
	}
</style>
