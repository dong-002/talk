<template>
	<view class="reply">
		<view class="first-comment">
			<commentItem :item="replyItem" :isreplyPage="true" :showCancel="false"></commentItem>
		</view>
		<u-empty mode="comment" icon="https://cdn.uviewui.com/uview/empty/comment.png" width="300" textSize="30"
			v-if="!commentList.length && noComment">
		</u-empty>
		<view class="second-comment" v-else>
			<template v-for="item in commentList">
				<commentItem :item="item" @delCallback="delCallback" :isreplyPage="true"></commentItem>
			</template>
			<u-loadmore :status="status" fontSize="24" iconSize="30" />
		</view>
		<view class="input">
			<commentInput :commentObj="commentObj" :placeholder="'@'+getName(replyItem)"
				@commentCallback="commentCallback"></commentInput>
		</view>
	</view>
</template>

<script>
	const db = uniCloud.database();
	import {
		getAvatar,
		getName
	} from "@/utils/index.js"
	import {
		store,
	} from '@/uni_modules/uni-id-pages/common/store.js'
	export default {
		data() {
			return {
				replyItem: {},
				// 回复框相关
				commentObj: {
					article_id: "",
					comment_type: 1,
					reply_user_id: "",
					reply_comment_id: ""
				},
				commentList: [],
				noComment: false,
				status: 'loadmore'
			};
		},
		onLoad() {
			let item = uni.getStorageSync("replyItem")
			if (!item) {
				uni.showToast({
					title: "参数错误",
					icon: "none"
				})
				uni.navigateBack()
				return
			}
			this.replyItem = item

			// 二级评论
			this.commentObj.article_id = item.article_id
			this.commentObj.reply_user_id = item.user_id[0]._id
			this.commentObj.reply_comment_id = item._id
			this.getCommentList()
		},
		onReachBottom() {
			if (this.status == 'nomore') {
				return
			}
			this.status = 'loading'
			this.getCommentList()
		},
		methods: {
			getAvatar,
			getName,
			// 获取二级评论列表
			async getCommentList() {
				let comTemp = await db.collection('talk-comment').where(`reply_comment_id=='${this.replyItem._id}'`)
					.getTemp()
				let userTemp = await db.collection('uni-id-users').field("_id,username,avatar_file").getTemp()
				db.collection(comTemp, userTemp).orderBy("comment_date desc").skip(this.commentList.length).limit(10)
					.get().then(res => {
						if (res.result.data.length == 0) {
							this.noComment = true
						}
						// 下拉加载更多
						if (res.result.data.length < 10) {
							this.status = 'nomore'
						}
						this.commentList = [...this.commentList, ...res.result.data]
					})
			},
			// 评论回调
			commentCallback(comData) {
				this.commentList.unshift({
					...comData,
					...this.commentObj,
					user_id: [store.userInfo]
				})
			},
			// 删除评论回调，在父组件删除
			delCallback(e) {
				let index = this.commentList.findIndex(item => {
					return item._id == e.id
				})
				this.commentList.splice(index, 1)

			},
			onUnload() {
				uni.removeStorageSync("replyItem")
			}
		}
	}
</script>

<style lang="scss" scoped>
	.reply {
		.first-comment {
			padding: 30rpx;
			border-bottom: 10rpx solid #eee;
		}

		.second-comment {
			padding: 30rpx;
			padding-bottom: 130rpx;
		}
	}
</style>