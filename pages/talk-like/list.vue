<template>
	<view class="container">
		<unicloud-db ref="udb" v-slot:default="{data, pagination, loading, hasMore, error}" orderby="like_date desc"
			:collection="collectionList" field="article_id,user_id,like_date">
			<view v-if="error">{{error.message}}</view>
			<view v-else-if="data">
				<uni-list>
					<uni-list-item v-for="(item, index) in data" :key="index" showArrow :clickable="true"
						@click="handleItemClick(item.article_id[0]._id)">
						<template v-slot:body>
							<text>
								<!-- 此处默认显示为_id，请根据需要自行修改为其他字段 -->
								<!-- 如果使用了联表查询，请参考生成的 admin 项目中 list.vue 页面 -->
								{{item.article_id[0].title}}
							</text>
						</template>
					</uni-list-item>
				</uni-list>
			</view>
			<uni-load-more :status="loading?'loading':(hasMore ? 'more' : 'noMore')"></uni-load-more>
		</unicloud-db>
	</view>
</template>

<script>
	const db = uniCloud.database()
	export default {
		data() {
			return {
				collectionList: [
					db.collection("talk-like").where(`user_id==$cloudEnv_uid`).getTemp(),
					db.collection("talk-article").field("_id,title").getTemp()
				],
				loadMore: {
					contentdown: '',
					contentrefresh: '',
					contentnomore: ''
				}
			}
		},
		onPullDownRefresh() {
			this.$refs.udb.loadData({
				clear: true
			}, () => {
				uni.stopPullDownRefresh()
			})
		},
		onReachBottom() {
			this.$refs.udb.loadMore()
		},
		methods: {
			handleItemClick(id) {
				uni.navigateTo({
					url: '/pages/detail/detail?id=' + id
				})
			}
		}
	}
</script>

<style>
</style>