const db = uniCloud.database()
const cmd = db.command
module.exports = {
	_before: function() { // 通用预处理器

	},
	/**
	 * @param {Object} table 表名
	 * @param {Object} arrt 修改的属性
	 * @param {Object} id
	 * @param {Object} num 加减数量
	 */
	async updateFun(table, arrt, id, num) {
		let obj = {}
		obj[arrt] = cmd.inc(num)
		return await db.collection(table).doc(id).update(obj)
	}
}