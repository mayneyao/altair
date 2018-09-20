import localStorageDB from "localstoragedb";

export default function initdb() {
	// init db
	let db = new localStorageDB("altair", localStorage);

	if (db.isNew()) {
		db.createTable("gifx", ["image_url", "caption_template", "create_time", 'is_upload', 'is_fav', 'fav_id']);
		db.createTable("fav", ["image_url", "caption_template", "create_time", "source_type", "source_id"]);
	} else {
		if (!db.tableExists('gifx')) {
			db.createTable("gifx", ["image_url", "caption_template", "create_time", 'is_upload', 'is_fav', 'fav_id']);
		}
		if (!db.tableExists('fav')) {
			db.createTable("fav", ["image_url", "caption_template", "create_time", "source_type", "source_id"]);
		}
	}
	db.commit();
	return db
}