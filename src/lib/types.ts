/**
 * イベントデータの型定義
 */
export interface EventData {
	/**
	 * イベント名
	 */
	eventName: string;
	/**
	 * メインハッシュタグ (#から始まる)
	 */
	mainHashtag: string;
	/**
	 * トラック情報 (キー: トラック名, 値: トラックハッシュタグ)
	 * 最低1つ以上のトラックが必要
	 */
	tracks: { [key: string]: string };
	/**
	 * アイコン絵文字 (任意)
	 */
	iconEmoji?: string;
}
