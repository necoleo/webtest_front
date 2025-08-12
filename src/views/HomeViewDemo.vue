<template>
  <div class="home-container">
    <SidebarDemo />
    <div class="main-content">
      <header class="top-header">
        <div class="header-left">
          <h1 class="page-title">欢迎回来，管理员</h1>
          <p class="page-subtitle">今天是美好的一天，让我们开始工作吧！</p>
        </div>
        <div class="header-right">
          <div class="notification-bell">
            <t-icon name="notification" />
            <span class="notification-badge">3</span>
          </div>
          <div class="user-profile">
            <img class="profile-avatar" src="@/assets/logo/logo.png" alt="用户头像" />
          </div>
        </div>
      </header>

      <section class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon users-icon">
              <t-icon name="user" />
            </div>
            <div class="stat-content">
              <h3 class="stat-number">1,234</h3>
              <p class="stat-label">总用户数</p>
            </div>
            <div class="stat-trend positive">
              <t-icon name="trending-up" />
              <span>+12%</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon orders-icon">
              <t-icon name="file" />
            </div>
            <div class="stat-content">
              <h3 class="stat-number">856</h3>
              <p class="stat-label">今日订单</p>
            </div>
            <div class="stat-trend positive">
              <t-icon name="trending-up" />
              <span>+8%</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon revenue-icon">
              <t-icon name="money-circle" />
            </div>
            <div class="stat-content">
              <h3 class="stat-number">¥45,678</h3>
              <p class="stat-label">本月收入</p>
            </div>
            <div class="stat-trend positive">
              <t-icon name="trending-up" />
              <span>+15%</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon growth-icon">
              <t-icon name="chart" />
            </div>
            <div class="stat-content">
              <h3 class="stat-number">89.2%</h3>
              <p class="stat-label">增长率</p>
            </div>
            <div class="stat-trend negative">
              <t-icon name="trending-down" />
              <span>-2%</span>
            </div>
          </div>
        </div>
      </section>

      <section class="content-section">
        <div class="content-grid">
          <div class="content-card">
            <div class="card-header">
              <h3 class="card-title">
                <t-icon name="activity" />
                最近活动
              </h3>
              <t-button theme="default" variant="text" size="small">查看全部</t-button>
            </div>
            <div class="card-content">
              <div class="activity-list">
                <div class="activity-item">
                  <div class="activity-icon user-activity">
                    <t-icon name="user-add" />
                  </div>
                  <div class="activity-info">
                    <p class="activity-text">新用户 <strong>张三</strong> 注册成功</p>
                    <span class="activity-time">2分钟前</span>
                  </div>
                </div>
                <div class="activity-item">
                  <div class="activity-icon order-activity">
                    <t-icon name="check-circle" />
                  </div>
                  <div class="activity-info">
                    <p class="activity-text">订单 <strong>#12345</strong> 已完成</p>
                    <span class="activity-time">15分钟前</span>
                  </div>
                </div>
                <div class="activity-item">
                  <div class="activity-icon system-activity">
                    <t-icon name="setting" />
                  </div>
                  <div class="activity-info">
                    <p class="activity-text">系统更新完成</p>
                    <span class="activity-time">1小时前</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="content-card">
            <div class="card-header">
              <h3 class="card-title">
                <t-icon name="play-circle" />
                快速操作
              </h3>
            </div>
            <div class="card-content">
              <div class="quick-actions">
                <t-button class="quick-action-btn" theme="primary" variant="outline" size="large">
                  <t-icon name="user-add" />
                  添加用户
                </t-button>
                <t-button class="quick-action-btn" theme="primary" variant="outline" size="large">
                  <t-icon name="file-add" />
                  创建订单
                </t-button>
                <t-button class="quick-action-btn" theme="primary" variant="outline" size="large">
                  <t-icon name="setting" />
                  系统设置
                </t-button>
                <t-button class="quick-action-btn" theme="primary" variant="outline" size="large">
                  <t-icon name="chart" />
                  查看报表
                </t-button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer class="footer">
        <p>&copy; 2024 WebTest. 保留所有权利。</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import SidebarDemo from '@/components/SidebarDemo.vue';
</script>

<style scoped>
.home-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.main-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.notification-bell {
  position: relative;
  width: 45px;
  height: 45px;
  background: rgba(125, 178, 197, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #7db2c5;
}

.notification-bell:hover {
  background: rgba(125, 178, 197, 0.2);
  transform: scale(1.05);
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff4757;
  color: white;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.profile-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(125, 178, 197, 0.3);
  transition: all 0.3s ease;
}

.profile-avatar:hover {
  border-color: #7db2c5;
  transform: scale(1.05);
}

.stats-section {
  margin-bottom: 40px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: white;
}

.users-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.orders-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.revenue-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.growth-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 5px 0;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
}

.stat-trend.positive {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.stat-trend.negative {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.content-section {
  margin-bottom: 40px;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
}

.content-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(125, 178, 197, 0.05);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.card-content {
  padding: 30px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(125, 178, 197, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: rgba(125, 178, 197, 0.1);
  transform: translateX(5px);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
}

.user-activity {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.order-activity {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.system-activity {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.activity-info {
  flex: 1;
}

.activity-text {
  font-size: 0.95rem;
  color: #333;
  margin: 0 0 5px 0;
}

.activity-time {
  font-size: 0.8rem;
  color: #999;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.quick-action-btn {
  height: 60px;
  border-radius: 12px;
  border: 2px solid rgba(125, 178, 197, 0.3);
  color: #7db2c5;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.quick-action-btn:hover {
  border-color: #7db2c5;
  background: rgba(125, 178, 197, 0.1);
  transform: translateY(-2px);
}

.footer {
  text-align: center;
  padding: 30px;
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 20px;
  }
  
  .top-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
}
</style>
