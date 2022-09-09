import { connect } from 'dva';
import DevDrawer from '@/pages/DataDevelopment/components/DevDrawer';
import { useEffect, useRef, useState } from 'react';
import MyTable from '@/components/CommonTable';
import { DrawerIcon } from '@/pages/DataDevelopment/icon';
import Pagination from '@/pages/DataDevelopment/components/Pagination';
import type { ActionType, ProColumns } from '@ant-design/pro-table';

let dependencyByTable: any = [];

const RelyListDrawer: React.FC<any> = (props) => {
  const {
    relyList,
    dispatch,
    currentJSONData,
    jobList, // 作业准备列表数据
  } = props;
  const actionRef = useRef<ActionType>(); // antd-pro-Table手动触发刷新需要自定义ref
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns: ProColumns<any>[] = [
    {
      title: '作业名（外部）',
      dataIndex: 'jobName',
      key: 'jobName',
    },
    {
      title: '对应表',
      dataIndex: 'tabName',
      key: 'tabName',
    },
    {
      title: '依赖关系',
      dataIndex: 'isRelyInfo',
      key: 'isRelyInfo',
    },
    {
      title: '未依赖',
      dataIndex: 'noRelyInfo',
      key: 'noRelyInfo',
    },
  ];

  const onCancel = () => {
    dispatch({
      type: 'graphModel/setRelyList',
      payload: {
        visible: false,
        data: {},
      },
    });
  };

  // 此表在当前作业准备列表所有的父级job
  const getAllRelyJob = (tableName: string) => {
    const data: any = [];
    jobList.forEach((el: any) => {
      if (el.children && el.children.length) {
        const item = el.children.find((i: any) => i.title === tableName);
        if (item) {
          data.push({
            title: el.title,
            key: el.key,
          });
        }
      }
    });
    return data;
  };

  // 所有的依赖连线
  const getDependency = () => {
    const allDependency: any = []; // 所有的依赖连线
    currentJSONData.forEach((item: any) => {
      if (item.shape === 'dag-edge') {
        allDependency.push(item);
      }
    });
    return allDependency;
  };

  // 当前作业准备列表包含此表的作业之间的依赖关系
  const getDependencyByTable = (id: any, allDependency: any) => {
    const list1: any = [];
    allDependency.forEach((item: any) => {
      if (item.target.cell === id && !dependencyByTable.includes(id)) {
        dependencyByTable.push(item.source.cell);
        list1.push(item.source.cell);
      }
    });
    list1.forEach((item: any) => {
      getDependencyByTable(item, allDependency);
    });
  };

  // 当前作业准备列表包含此表的作业之间的依赖关系  方向反转
  const getDependencyByTableReverse = (id: any, allDependency: any) => {
    const list1: any = [];
    allDependency.forEach((item: any) => {
      if (item.source.cell === id && !dependencyByTable.includes(id)) {
        dependencyByTable.push(item.target.cell);
        list1.push(item.target.cell);
      }
    });
    list1.forEach((item: any) => {
      getDependencyByTable(item, allDependency);
    });
  };

  useEffect(() => {
    dependencyByTable = [];
    console.log(currentJSONData);
    if (currentJSONData.length) {
      setLoading(true);
      const data: any = [];
      currentJSONData.forEach((item: any) => {
        if (item.shape === 'dag-node' && item.data.outRely) {
          const isRely: any = []; // 已依赖
          const noRely: any = []; // 未依赖
          const allRelyJob: any = getAllRelyJob(item.data.tableInfo.title); // 此表在当前作业准备列表所有的父级job
          const allDependency: any = getDependency(); // 所有的依赖连线
          getDependencyByTable(item.id, allDependency); // 当前作业准备列表包含此表的作业之间的依赖关系
          getDependencyByTableReverse(item.id, allDependency); // 当前作业准备列表包含此表的作业之间的依赖关系 方向反转
          dependencyByTable = [...new Set(dependencyByTable)]; // 去重
          allRelyJob.forEach((el: any) => {
            if (dependencyByTable.includes(el.key)) {
              isRely.push(el.title);
            } else {
              noRely.push(el.title);
            }
          });
          data.push({
            ...item,
            jobName: item.data.label,
            tabName: item.data.tableInfo.title,
            isRelyInfo: isRely.toString(),
            noRelyInfo: noRely.toString(),
          });
        }
      });
      setList(data);
      setLoading(false);
    }
  }, [currentJSONData]);

  return (
    <div>
      {relyList.visible && (
        <DevDrawer
          visible={relyList.visible}
          title="内部依赖"
          width={600}
          onClose={onCancel}
          closeIcon={<DrawerIcon />}
        >
          <>
            <MyTable
              columns={columns}
              rowKey="id"
              request={() => {
                // 表单搜索项会从 params 传入，传递给后端接口。
                return Promise.resolve({
                  // data: list.list || [],
                  data: list,
                  success: true,
                });
              }}
              actionRef={actionRef}
              toolBarRender={false}
              search={false}
              pagination={false}
              titleIcon={true}
              bordered
              top={0}
              loading={loading}
              scroll={{ x: 'max-content' }}
            />
            {/* {list.total ? ( */}
            <Pagination
              showQuickJumper={false}
              defaultCurrent={1}
              showSizeChanger
              total={list.length}
              // onChange={onChangeP}
              showTotal
              style={{ marginTop: 30 }}
            />
            {/* ) : null} */}
          </>
        </DevDrawer>
      )}
    </div>
  );
};

export default connect(
  ({ graphModel, fileListModel }: { graphModel: any; fileListModel: any }) => ({
    relyList: graphModel.relyList,
    currentJSONData: graphModel.currentJSONData,
    jobList: fileListModel.jobList,
  }),
)(RelyListDrawer);
