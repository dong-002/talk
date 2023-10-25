<template>
	<view class="user">
		<view class="top">
			<view class="bg">
				<image v-if="hasLogin&&userInfo.avatar_file&&userInfo.avatar_file.url" :src="userInfo.avatar_file.url">
				</image>
				<image v-else src="../../static/1.jpg"></image>
			</view>
			<view class="userinfo">
				<view class="left">
					<u-avatar v-if="hasLogin&&userInfo.avatar_file&&userInfo.avatar_file.url"
						:src="userInfo.avatar_file.url" shape="circle" size="100"></u-avatar>
					<u-avatar v-else shape="circle" size="100"></u-avatar>
					<view class="info" v-if="hasLogin" @click="toUcenter">
						<view class="name">{{userInfo.nickname||userInfo.username||userInfo.mobile}}
						</view>
						<view class="time">
							<uni-dateformat :date="userInfo.
register_date" format="yyyy/MM/dd" :threshold="[60000,3600000*24*10]" />注册
						</view>
					</view>
					<view class="name" @click="login" v-if="!hasLogin" style="padding-left: 20rpx;">
						点击登录
					</view>
				</view>
				<view class="right">
					<u-icon name="arrow-right" color="#fff" size="32"></u-icon>
				</view>
			</view>
		</view>
		<view class="container">
			<view class="top-panel">
				<text class="txt"><text class="num">{{likeCount}}</text>获赞</text>
				<text class="txt"><text class="num">{{commentCount}}</text>获评</text>
				<text class="txt"><text class="num">{{articleCount}}</text>发文</text>
			</view>
			<view class="group">
				<view class="item" @click="gotoList">
					<view class="left">
						<text class="iconfont icon-fabu"></text>
						<text>我的长文</text>
					</view>
					<view class="right">
						<u-icon name="arrow-right" color="#aaa" size="30"></u-icon>
					</view>
				</view>
				<view class="item" @click="gotoLike">
					<view class="left">
						<text class="iconfont icon-dianzan"></text>
						<text>我的点赞</text>
					</view>
					<view class="right">
						<u-icon name="arrow-right" color="#aaa" size="30"></u-icon>
					</view>
				</view>
				<view class="item" @click="gotoComment">
					<view class="left">
						<text class="iconfont icon-pinglun"></text>
						<text>评论过的</text>
					</view>
					<view class="right">
						<u-icon name="arrow-right" color="#aaa" size="30"></u-icon>
					</view>
				</view>
			</view>
			<view class="group">
				<view class="item">
					<view class="left">
						<text class="iconfont icon-xinxikongxin"></text>
						<text>关于</text>
					</view>
					<view class="right">
						<u-icon name="arrow-right" color="#aaa" size="30"></u-icon>
					</view>
				</view>
				<view class="item" @click="gotoFeedBack">
					<view class="left">
						<text class="iconfont icon-xiaoxi"></text>
						<text>意见反馈</text>
					</view>
					<view class="right">
						<u-icon name="arrow-right" color="#aaa" size="30"></u-icon>
					</view>
				</view>
			</view>
			<view class="group">
				<view class="item" @click="logout">
					<view class="left">
						<text class="iconfont icon-tuichu"></text>
						<text>退出登录</text>
					</view>
					<view class="right">
						<u-icon name="arrow-right" color="#aaa" size="30"></u-icon>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		store,
		mutations
	} from '@/uni_modules/uni-id-pages/common/store.js'
	const db = uniCloud.database()
	export default {
		data() {
			return {
				likeCount: 0,
				articleCount: 0,
				commentCount: 0
			};
		},
		onLoad() {
			this.getData()
		},
		methods: {
			// 获取点赞,评论,发文数量
			async getData() {
				let art = await db.collection('talk-article').where(`user_id==$cloudEnv_uid`).count()
				this.articleCount = art.result.total

				let like = await db.collection('talk-article').where(`user_id==$cloudEnv_uid`).groupBy('user_id')
					.groupField('sum(like_count) as num ').get({
						getOne: true
					})
				this.likeCount = like.result.data.num


				let artRes = await db.collection('talk-article').where(`user_id==$cloudEnv_uid`).get()
				let artIdArr = artRes.result.data.map(item => {
					return item._id
				})
				let comment = await db.collection('talk-comment').where({
					article_id: db.command.in(artIdArr)
				}).get()
				this.commentCount = comment.result.data.length
			},

			login() {
				uni.navigateTo({
					url: "/uni_modules/uni-id-pages/pages/login/login-withpwd"
				})
			},
			toUcenter() {
				uni.navigateTo({
					url: "/uni_modules/uni-id-pages/pages/userinfo/userinfo"
				})
			},

			isLogin() {
				if (!this.hasLogin) {
					uni.showToast({
						title: "未登录",
						icon: "none"
					})
					return false
				}
				return true
			},
			logout() {
				if (!this.isLogin()) return
				uni.showModal({
					title: "确认退出吗？",
					success(res) {
						// console.log(res);
						if (res.confirm)
							mutations.logout()
					}
				})

			},
			// 长文
			gotoList() {
				if (!this.isLogin()) return
				uni.navigateTo({
					url: "/pages/talk-article/list"
				})
			},
			// 我的点赞
			gotoLike() {
				if (!this.isLogin()) return
				uni.navigateTo({
					url: "/pages/talk-like/list"
				})
			},
			gotoComment() {
				if (!this.isLogin()) return
				uni.navigateTo({
					url: "/pages/talk-comment/list"
				})
			},
			// 意见反馈
			gotoFeedBack() {
				if (!this.isLogin()) return
				uni.navigateTo({
					url: "/uni_modules/uni-feedback/pages/opendb-feedback/opendb-feedback"
				})
			}
		},
		computed: {
			userInfo() {
				return store.userInfo
			},
			hasLogin() {
				return store.hasLogin
			},
		}
	}
</script>

<style lang="scss">
	.user {


		.top {
			background-color: #bbb;
			height: 300rpx;
			position: relative;
			display: flex;
			align-items: center;
			padding: 0 30rpx;
			padding-top: var(--status-bar-height);

			.bg {
				position: absolute;
				top: 0%;
				left: 0;
				width: 100%;
				height: 100%;
				overflow: hidden;

				image {
					width: 100%;
					height: 100%;
					filter: blur(20px);
					opacity: .8;
					transform: scale(2);
				}
			}

			.userinfo {
				width: 100%;
				display: flex;
				align-items: center;
				justify-content: space-between;
				position: relative;

				.left {
					display: flex;
					align-items: center;
					color: #fff;

					.name {
						font-size: 36rpx;
						font-weight: bold;
					}

					.info {
						margin-left: 20rpx;



						.time {
							color: #dddddd;
							font-size: 30rpx;
						}
					}
				}
			}
		}

		.container {
			background-color: #fff;

			border-radius: 30rpx 30rpx 0 0;
			margin-top: -20rpx;
			position: relative;

			.top-panel {
				height: 100rpx;
				display: flex;
				align-items: center;
				padding: 0 30rpx;
				font-size: 30rpx;

				.txt {
					padding-right: 20rpx;
				}

				.num {
					font-weight: bold;
				}
			}

			.group {
				padding: 14rpx 30rpx;
				border-bottom: 10rpx solid #eee;

				.item {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 28rpx 0;

					.left {
						font-size: 34rpx;

						.iconfont {
							font-size: 38rpx;
							padding-right: 18rpx;
						}
					}
				}
			}

			.group:last-child {
				border: none;
			}
		}
	}
</style>