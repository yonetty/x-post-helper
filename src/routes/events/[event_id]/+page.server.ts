import type { PageServerLoad } from './$types';
import type { EventData } from '$lib/types';
import { error } from '@sveltejs/kit'; // エラーハンドリング用にインポート

export const load: PageServerLoad = async ({ params }) => {
	const eventId = params.event_id; // URLから event_id を取得

	try {
		// event_id に基づいて動的にJSONファイルをインポート
		const eventJson = await import(`../../../lib/event-data/${eventId}.json`);
		// デフォルトエクスポートを取得 (import() は Module オブジェクトを返すため)
		const eventData: EventData = eventJson.default as EventData;

		// TODO: ここで eventData の内容をバリデーションする処理を追加するとより堅牢になります
		// 例: if (!eventData.eventName || !eventData.mainHashtag || !eventData.tracks) throw new Error('Invalid event data');

		// データをページコンポーネントに渡す
		return {
			eventData
		};
	} catch (e) {
		// ファイルが存在しない、またはJSONの形式が不正な場合など
		console.error(`Failed to load event data for ${eventId}:`, e);
		// 404エラーを返す
		error(404, {
			message: `Event '${eventId}' not found`
		});
	}
};
