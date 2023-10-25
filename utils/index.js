export function getImgUrl(richtext, num = 3) {
	let imgList = [];
	richtext.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/g, (match, capture) => {
		imgList.push(capture);
	});
	imgList = imgList.slice(0, num)
	return imgList;
}

export function getProvince() {
	return new Promise((resolve, reject) => {
		let his = uni.getStorageSync("history")
		// 如果在内存中有省份,并且不超过3小时
		if (his && ((Date.now() - his.time) > 1000 * 60 * 60 * 3)) {
			resolve(his.province)
		} else {
			// 内存中没有,或者超过3小时
			uni.request({
				// 要在高得地图中申请key 
				url: "https://restapi.amap.com/v3/ip?key=ebe8a28f9c42f8025a1f4a3bdbc06d93",
				success(res) {
					let province = ""
					if (typeof res.data.province == "string") {
						province = res.data.province
					} else {
						province = "未知"
					}
					resolve(province)
					let history = {
						province: province,
						time: Date.now()
					}
					uni.setStorageSync("history", history)
				},
				fail(err) {
					reject(err)
				}
			})
		}

	})
}

export function getName(data) {
	return data.user_id[0].username || data.user_id[0].username || data.user_id[0].mobile || "请设置昵称"
}

export function getAvatar(data) {
	return data?.user_id[0]?.avatar_file?.url ?? ''
}