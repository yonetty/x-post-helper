import type { PageServerLoad, EntryGenerator } from './$types';
import type { EventData } from '$lib/types';
import { error } from '@sveltejs/kit';
import fs from 'fs/promises'; // Node.jsのfsモジュールをインポート
import path from 'path'; // Node.jsのpathモジュールをインポート

// プロジェクトルートからの相対パスで event-data ディレクトリを指定
const eventDataDir = path.resolve('src/lib/event-data');

// ビルド時にプリレンダリングするエントリ（event_id）を指定
export const entries: EntryGenerator = async () => {
	try {
		// src/lib/event-data ディレクトリ内の .json ファイル名を読み取る
		const files = await fs.readdir(eventDataDir);
		const eventIds = files
			.filter((file) => file.endsWith('.json'))
			.map((file) => file.replace('.json', '')); // .json 拡張子を除去

		// EntryGenerator の形式に変換
		return eventIds.map((event_id) => ({ event_id }));
	} catch (e) {
		// ディレクトリが存在しない場合などは空配列を返す
		console.error('Failed to read event data directory for entries:', e);
		return [];
	}
};

// prerender = true を設定して、entriesで指定されたページが確実にビルドされるようにする
export const prerender = true;

export const load: PageServerLoad = async ({ params }) => {
	const eventId = params.event_id;

	try {
		// event_id に基づいて動的にJSONファイルをインポート
		// $lib エイリアスを使う
		const eventJson = await import(`$lib/event-data/${eventId}.json`);
		const eventData: EventData = eventJson.default as EventData;

		// バリデーション (例)
		if (!eventData || typeof eventData !== 'object' || !eventData.eventName) {
			throw new Error('Invalid event data format');
		}

		return {
			eventData
		};
	} catch (e) {
		console.error(`Failed to load event data for ${eventId}:`, e);
		// import() が失敗した場合 (ファイルが存在しないなど) は 404 エラー
		error(404, {
			message: `Event '${eventId}' not found or data is invalid`
		});
	}
};
