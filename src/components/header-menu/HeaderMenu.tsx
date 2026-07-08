import { Menu } from 'antd';
import { UserOutlined, AppstoreOutlined, InfoCircleOutlined, SettingOutlined } from '@ant-design/icons';

export const HeaderMenu = () => (
  <Menu
    items={[
      {
        key: '1',
        label: (
          <a href="/profile">
            <UserOutlined /> Имя пользователя
          </a>
        ),
      },
      {
        type: 'divider',
      },
      {
        key: '2',
        label: (
          <a href="/categories">
            <AppstoreOutlined /> Категории
          </a>
        ),
      },
      {
        key: '3',
        label: (
          <a href="/instructions">
            <InfoCircleOutlined /> Инструкции
          </a>
        ),
      },
      {
        key: '4',
        label: (
          <a href="/about">
            <SettingOutlined /> О сервисе
          </a>
        ),
      },
    ]}
  />
);
