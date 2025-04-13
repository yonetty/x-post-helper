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
	 * トラック情報 (オブジェクトの配列)
	 * 各オブジェクトは name と hashtag プロパティを持つ
	 * 最低1つ以上のトラックが必要
	 */
	tracks: { name: string; hashtag: string }[];
	/**
	 * アイコン絵文字 (任意)
	 */
	iconEmoji?: string;
}
