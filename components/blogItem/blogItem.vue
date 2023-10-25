<template>
	<view class="blog-item">
		<view class="top">
			<view class="info">
				<u-avatar :src="getAvatar(blogItem)" shape="circle" size="50"></u-avatar>
				<text class="name">{{getName(blogItem)}}</text>
				<uni-dateformat format="yyyy/MM/dd" :threshold="[60000,3600000*24*7]" :date="blogItem.publish_date"
					class="date" />
			</view>
			<view class="more" @click="clickMore">
				<text class="iconfont icon-gengduo"></text>
			</view>
		</view>
		<view class="blog-content">
			<view class="title" @click="gotoDetail">{{blogItem.title}}</view>
			<view class="content" @click="gotoDetail">{{blogItem.desc}}</view>
			<view class="img-list">
				<view class="img-item" v-for="(item,index) in blogItem.picUrl"
					:class="[blogItem.picUrl.length==1?'only':'']" @click="previewImg(index)">
					<img :src="item" mode="aspectFit">
				</view>
			</view>
		</view>
		<view class="bottom">
			<text class="iconfont icon-yanjing">
				<text>{{blogItem.view_count}}</text>
			</text>
			<text class="iconfont icon-xiaoxi2" @click="gotoDetail">
				<text>{{blogItem.comment_count>0?blogItem.comment_count:'评论'}}</text>
			</text>
			<text class="iconfont icon-dianzan" :class="blogItem.isLike?'active':''" @click="handleLike">
				<text>{{blogItem.like_count?blogItem.like_count:'点赞'}}</text>
			</text>
		</view>
		<u-action-sheet :actions="list" :show="show" :closeOnClickOverlay="true" :closeOnClickAction="true"
			@select="selectSheet" @close="closeSheet" cancelText="取消"></u-action-sheet>
	</view>

</template>

<script>
	import {
		getAvatar,
		getName
	} from "@/utils/index.js"
	import {
		store,
	} from '@/uni_modules/uni-id-pages/common/store.js'
	const db = uniCloud.database()
	const utilsObj = uniCloud.importObject("utilsObj", {
		customUI: true
	})
	export default {
		name: "blogItem",
		props: ["blogItem", 'isLike', "like_count"],
		data() {
			return {
				show: false,
				list: [{
					name: '修改',
					type: "edit",
					disabled: true
				}, {
					name: "删除",
					type: "del",
					color: '#fa3534',
					disabled: true
				}]
			};
		},
		onLoad() {

		},
		methods: {
			getAvatar,
			getName,
			// 点赞处理
			async handleLike() {
				// 没有登录不能点赞
				if (!store.hasLogin) {
					uni.showToast({
						title: "请登录",
						icon: "none",
						mask: true
					})
					setTimeout(() => {
						uni.navigateTo({
							url: "/uni_modules/uni-id-pages/pages/login/login-withpwd"
						})
					}, 1000)
					return
				}

				let time = Date.now()
				// 防止恶意点击发送多次请求
				if (time - this.likeTime < 2000) {
					uni.showToast({
						title: "操作频繁，请稍后···",
						icon: "none"
					})
					return
				}
				this.likeTime = time

				// 父子组件的数据双向绑定
				let like_count = this.blogItem.like_count
				this.blogItem.isLike ? like_count-- : like_count++
				this.$emit("update:like_count", like_count)
				let isLike = !this.blogItem.isLike
				this.$emit("update:isLike", isLike)
				// 发送请求
				let count = await db.collection('talk-like').where(
					`article_id=='${this.blogItem._id}'&&user_id==$cloudEnv_uid`).count()
				if (!count.result.total) {
					// 添加
					db.collection('talk-like').add({
						article_id: this.blogItem._id
					}).then(res => {
						utilsObj.updateFun("talk-article", "like_count", this.blogItem._id, 1)
					})
				} else {
					// 删除
					db.collection('talk-like').where(`article_id=='${this.blogItem._id}'&&user_id==$cloudEnv_uid`)
						.remove()
					utilsObj.updateFun("talk-article", "like_count", this.blogItem._id, -1)
				}

			},
			// 点击更多
			clickMore() {
				let uid = uniCloud.getCurrentUserInfo().uid == this.blogItem.user_id[0]._id
				if (uid || this.uniIDHasRole('admin') || this.uniIDHasRole('master')) {
					this.list.forEach(item => {
						item.disabled = false
					})
				}
				this.show = true
			},
			// 修改还是删除
			selectSheet(e) {
				let type = e.type
				if (e.type == 'edit') {
					this.editFun()
				} else {
					this.delFun()
				}
			},
			editFun() {
				uni.navigateTo({
					url: "/pages/editor/editor?id=" + this.blogItem._id
				})
			},
			delFun() {
				uni.showModal({
					title: "确定删除吗？",
					success: (res) => {
						if (res.confirm) {
							console.log(this.blogItem._id);
							db.collection('talk-article').doc(this.blogItem._id).update({
								delStatus: true
							})
							this.$emit("delItem")
						}
					}
				})
			},
			closeSheet() {
				this.show = false
			},
			previewImg(index) {
				uni.previewImage({
					urls: this.blogItem.picUrl,
					current: index
				})
			},
			gotoDetail() {
				uni.navigateTo({
					url: "/pages/detail/detail?id=" + this.blogItem._id
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.blog-item {
		padding: 20rpx;

		.top {
			display: flex;
			justify-content: space-between;

			.info {
				display: flex;

				.name {
					padding: 0 15rpx;
				}

				.date {
					color: #bdbdbd;
				}
			}

		}

		.blog-content {
			.title {
				font-size: 36rpx;
				font-weight: bold;
				padding: 10rpx 0;
			}

			.content {
				display: -webkit-box;
				overflow: hidden;
				text-overflow: -o-ellipsis-lastline;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 2;
				line-clamp: 2;
				color: #888;
			}

			.img-list {
				display: flex;
				margin: 10rpx 0;

				.img-item {
					width: 200rpx;
					height: 200rpx;
					overflow: hidden;
					margin-right: 6rpx;

					img {
						width: 100%;
						height: 100%;
					}


					&:first-child {
						border-radius: 20rpx 0 0 20rpx;
					}

					&:last-child {
						border-radius: 0 20rpx 20rpx 0;
					}

					&.only {
						border-radius: 20rpx;
					}

				}
			}
		}

		.bottom {
			display: flex;
			justify-content: space-between;
			padding: 0 80rpx;
			margin-top: 20rpx;

			.iconfont {
				font-size: 38rpx;

				&:before {
					padding-right: 8rpx;
				}

				text {
					font-size: 30rpx;
				}
			}

			.active {
				color: #50bcf5;
			}
		}
	}
</style>