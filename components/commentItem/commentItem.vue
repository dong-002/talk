<template>
	<view>
		<view class="comment-item">
			<u-avatar :src="getAvatar(item)" size="60"></u-avatar>
			<view class="right">
				<view class="name">
					{{getName(item)}}
				</view>
				<view class="comment-content">
					{{item.comment_content}}
				</view>
				<view class="info">
					<view @click="gotoReply">
						<view class="reply" v-if="!isreplyPage">{{item.replyCount?item.replyCount:''}}回复</view>
						<uni-dateformat format="yyyy/MM/dd" :threshold="[60000,3600000*10]" :date="item.comment_date"
							class="date" />
						<text>{{item.province}}</text>
					</view>
					<view class="cancel" @click="cancel" v-if="showCancel">
						删除
					</view>
				</view>
			</view>
		</view>

	</view>
</template>

<script>
	import {
		getAvatar,
		getName
	} from "@/utils/index.js"
	const db = uniCloud.database()
	const utilsObj = uniCloud.importObject("utilsObj", {
		customUI: true
	})
	export default {
		name: "commentItem",
		props: {
			item: {
				type: Object,
				default () {
					return {

					}
				}
			},
			isreplyPage: {
				type: Boolean,
				default: false
			},
			showCancel: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {

			};
		},
		methods: {
			getAvatar,
			getName,
			gotoReply() {
				if (this.isreplyPage) return
				uni.setStorageSync("replyItem", this.item)
				uni.navigateTo({
					url: "/pages/reply/reply"
				})
			},
			cancel() {
				let uid = uniCloud.getCurrentUserInfo().uid == this.item.user_id[0]._id
				if (uid || this.uniIDHasRole('admin') || this.uniIDHasRole('master')) {
					uni.showModal({
						title: "确定删除吗？",
						success: (res) => {
							if (res.confirm) {
								this.removeComment()
							}
						}
					})
					return
				}
				uni.showToast({
					title: "无删除权限",
					icon: "error"
				})


			},
			async removeComment() {
				await db.collection('talk-comment').doc(this.item._id).remove().then(res => {
					this.$emit('delCallback', this.item._id)
					uni.showToast({
						title: "删除成功"
					})
					utilsObj.updateFun('talk-article', 'comment_count', this.item.article_id, -1)
				})


			}
		}
	}
</script>

<style lang="scss">
	.comment-item {
		display: flex;
		margin-bottom: 30rpx;

		.right {
			margin-left: 20rpx;
			margin-top: 10rpx;
			width: 100%;

			.name {
				color: #848484;
				font-size: 30rpx;
			}

			.comment-content {
				font-size: 36rpx;
				padding: 10rpx 0;
			}

			.info {
				display: flex;
				justify-content: space-between;
				color: #848484;
				width: 100%;

				.reply {
					display: flex;
					align-items: center;
					justify-content: center;
					width: 110rpx;
					height: 56rpx;
					font-size: 28rpx;
					border-radius: 24rpx;
					background-color: #d3d3d3;
					margin-right: 26rpx;
				}

				.date {
					margin-right: 26rpx;
				}

				.cancel {
					width: 80rpx;
					height: 40rpx;
					font-size: 24rpx;
					color: #ef0000;
					display: flex;
					justify-content: center;
					align-items: center;
					background-color: #fff;
					border-radius: 18rpx;
				}
			}
		}
	}
</style>