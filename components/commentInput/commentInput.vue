<template>
	<view class="com-input">
		<view class="comment-input">
			<uni-easyinput v-model="comment" :placeholder="placeholder" suffix-icon="paperplane"
				@confirm="submitComment" @iconClick="submitComment"></uni-easyinput>
		</view>
	</view>
</template>

<script>
	const db = uniCloud.database()
	const utilsObj = uniCloud.importObject("utilsObj", {
		customUI: true
	})
	import {
		getProvince
	} from "@/utils/index.js"
	export default {
		name: "commentInput",
		props: {
			commentObj: {
				type: Object,
				default () {
					return {

					}
				}
			},
			placeholder: {
				type: String,
				default: "留下你的足迹吧"
			}
		},
		data() {
			return {
				comment: ""
			};
		},
		methods: {
			async submitComment() {
				if (!this.comment) {
					uni.showToast({
						title: "评论不能为空",
						icon: "none"
					})
					return
				}
				let provice = await getProvince()
				await db.collection('talk-comment').add({
					comment_content: this.comment,
					province: provice,
					...this.commentObj
				}).then(res => {
					uni.showToast({
						title: "评论成功",
					})
					// 数据库添加
					utilsObj.updateFun('talk-article', 'comment_count', this.commentObj.article_id, 1)
					// 逻辑添加
					this.$emit("commentCallback", {
						comment_content: this.comment,
						province: provice,
						comment_date: Date.now()
					})
					this.comment = ""
				})
			}
		}
	}
</script>

<style lang="scss">
	.com-input {
		width: 100%;
		position: fixed;
		bottom: 0%;
		left: 0;
		padding: 20rpx;
		box-sizing: border-box;
		background-color: #fff;

		.comment-input {
			width: 100%;

		}
	}
</style>