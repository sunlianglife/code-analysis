import { useState } from 'react';
import styles from './sqlLIstItem.less';
import { connect } from 'dva';
import service from './service';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import copy from 'copy-to-clipboard';
import { Dropdown, Menu, message, Spin } from 'antd';

interface IProps {
  dataBase: string;
  tableName: string;
  // tabKey: string;
  // onCancel: () => void;
  // dataLoading: boolean;
  // sqlJobModelData: any;
  // dataLoadingUpdate: any;
}

const SqlListItemTitle: React.FC<any> = (props) => {
  const { fieldName } = props;

  const CopyClick = () => {
    if (copy(`${fieldName}`)) {
      message.success('复制成功!');
    }
  };

  const menu = (
    <Menu onClick={CopyClick}>
      <Menu.Item>复制</Menu.Item>
    </Menu>
  );

  return <>
    <Dropdown overlay={menu} trigger={['contextMenu']}>
      <span className={styles.title} title={fieldName}>
        {fieldName}
      </span>
    </Dropdown>
  </>

}

const SqlListItem: React.FC<IProps> = (props) => {
  const { dataBase, tableName } = props;
  const [iconFlag, setIconFlag] = useState(false);
  const [fileldList, setFileldList] = useState([]);
  const [loading, setLoading] = useState(false);

  const getData = () => {
    setLoading(true);
    service.getField({ db: dataBase, table: tableName }).then((res: any) => {
      setFileldList(
        res.data.map((item: any) => {
          if (item.split('(').length > 1) {
            return { field: item.split('(')[0], type: item.split('(')[1].split(')')[0] };
          }
          return { field: item, type: '' };
        }),
      );
      setIconFlag(true);
      setLoading(false);
    });
  };

  const CopyClick = () => {
    if (copy(`${tableName}`)) {
      message.success('复制成功!');
    }
  };

  const menu = (
    <Menu onClick={CopyClick}>
      <Menu.Item>复制</Menu.Item>
    </Menu>
  );

  return (
    <div className={styles.sqlListItem}>
      <div className={styles.tableName}>
        <Spin spinning={loading}>
          {iconFlag ? (
            <DownOutlined style={{ color: '#868686' }} onClick={() => setIconFlag(false)} />
          ) : (
            <RightOutlined style={{ color: '#868686' }} onClick={getData} />
          )}
        </Spin>

        <Dropdown overlay={menu} trigger={['contextMenu']}>
          <span className={styles.title} title={tableName}>
            {tableName}
          </span>
        </Dropdown>
      </div>
      {iconFlag && fileldList?.length > 0 && (
        <div className={styles.field}>
          {fileldList.map((item: any) => (
            <div className={styles.fieldItem}>
              <SqlListItemTitle fieldName={item.field} />
              <div className={styles.type}>{item.type}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default connect()(SqlListItem);
