// 连线右键

import React from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { Menu } from '@antv/x6-react-components';
import styles from './index.less';
import { connect } from 'dva';
import { NewGraph } from '../graph';

const EdgeContextMenu: React.FC<any> = (props) => {
  const { selectEdgeData, dispatch } = props;
  // 右键触发
  if (!selectEdgeData?.date) {
    return null;
  }

  // 边删除
  const deleteEdge = () => {
    NewGraph.graph.removeEdge(selectEdgeData.data.edge.id);
    dispatch({
      type: 'graphModel/setSelectEdgeData',
      payload: {
        date: 0,
        data: {},
      },
    });
  };

  return (
    <div
      className={styles.mask}
      onClick={() => {
        dispatch({
          type: 'graphModel/setSelectEdgeData',
          payload: {
            date: 0,
            data: {},
          },
        });
      }}
    >
      <div
        className={styles.edgeContextMenu}
        style={{
          top: selectEdgeData?.data?.e?.clientY - 32,
          left: selectEdgeData?.data?.e?.clientX,
        }}
      >
        <Menu hasIcon={true}>
          <Menu.Item icon={<DeleteOutlined />} onClick={() => deleteEdge()} text="删除" />
        </Menu>
      </div>
    </div>
  );
};

export default connect(({ graphModel }: { graphModel: any }) => ({
  selectEdgeData: graphModel.selectEdgeData,
}))(EdgeContextMenu);
