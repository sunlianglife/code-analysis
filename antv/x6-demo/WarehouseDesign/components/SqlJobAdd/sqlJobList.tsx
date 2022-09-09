import { SearchIcon } from '@/pages/DataDevelopment/icon';
import { Spin, Input } from 'antd';
import { useEffect, useRef, useState } from 'react';
// import Pagination from '@/pages/DataDevelopment/components/Pagination'
import styles from './sqlJobList.less';
import service from './service';
import { connect } from 'dva';
import DevButton from '@/components/DevButton';
import SqlListItem from './sqlLIstItem';
import SelectM from '@/components/Select';
import { ReloadOutlined } from '@ant-design/icons';

const SqlJobList: React.FC<any> = (props: any) => {
  const { moveWidth } = props;
  const inputRef = useRef<any>()
  const [treeData, setTreeData] = useState<any>([]);
  const [treeDataAll, setTreeDataAll] = useState<any>([]);
  const [searchParams, setSearchParams] = useState<any>({ pageNum: 0 });
  const [pageDisabled, setPageDisabled] = useState(false);
  const [dbList, setDbList] = useState<any>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataBase, setDataBase] = useState('');

  useEffect(() => {
    service.getDbList().then((res: any) => {
      setDbList(res.data.map((i: any) => ({ value: i })));
    });
  }, []);

  useEffect(() => {
    const sliceData = treeDataAll.slice(searchParams.pageNum * 15, searchParams.pageNum * 15 + 15);
    setTreeData(sliceData);
    if (
      sliceData.length < 15 ||
      sliceData[sliceData.length - 1] === treeDataAll[treeDataAll.length - 1]
    ) {
      setPageDisabled(true);
    } else {
      setPageDisabled(false);
    }
  }, [searchParams]);

  // 刷新
  const onSearch = (value: any, flag?: boolean) => {
    setDataLoading(true);
    service.getTableList({ db: dataBase }).then((res: any) => {
      if(flag)(
        inputRef.current.value = ''
      )
      const filterData = flag ? res.data :  res.data.filter((item: any) => item.indexOf(value.target.value) > -1);
      setTreeDataAll(filterData);
      const sliceData = filterData?.slice(0 * 15, 0 * 15 + 15);
      setTreeData(sliceData);
      if (
        sliceData.length < 15 ||
        sliceData[sliceData.length - 1] === filterData[filterData.length - 1]
      ) {
        setPageDisabled(true);
      } else {
        setPageDisabled(false);
      }
      setSearchParams({ pageNum: 0 });
      setDataLoading(false);
    });
  };

  // 上一页下一页
  const goPage = (type: string) => {
    setSearchParams({
      ...searchParams,
      pageNum: type === 'next' ? searchParams.pageNum + 1 : searchParams.pageNum - 1,
    });
  };

  const dbChange = (value: any) => {
    if (value) {
      setDataBase(value.value);
      setDataLoading(true);
      service.getTableList({ db: value.value }).then((res: any) => {
        setTreeDataAll(res.data);
        const sliceData = res.data?.slice(0 * 15, 0 * 15 + 15);
        setTreeData(sliceData);
        if (
          sliceData.length < 15 ||
          sliceData[sliceData.length - 1] === res.data[res.data.length - 1]
        ) {
          setPageDisabled(true);
        } else {
          setPageDisabled(false);
        }
        setSearchParams({ pageNum: 0 });
        setDataLoading(false);
      });
    }
  };

  return (
    <div className={styles.SqlJobList} style={{ width: `${250 + moveWidth}px` }}>
      <Spin spinning={dataLoading}>
        <section style={{ height: '739px' }}>
          <div className={styles.SqlJobSearch}>
            <SelectM
              showSearch
              labelInValue
              placeholder="数据库切换"
              optionlist={dbList}
              labelkey="value"
              label="value"
              style={{ width: '100%' }}
              onChange={dbChange}
            />
          </div>
          <div className={styles.SqlJobSearch}>
            <Input
              prefix={<SearchIcon />}
              placeholder="表模糊搜索,回车确认"
              addonAfter={<ReloadOutlined onClick={() => onSearch('', true)} />}
              onPressEnter={onSearch}
              ref={inputRef}
            />
          </div>
          <div style={{ margin: '21px 16px 0 16px', overflowY: 'auto', height: '80%' }}>
            {treeData.map((item: any) => (
              <SqlListItem dataBase={dataBase} tableName={item} />
            ))}
          </div>
        </section>
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <DevButton
              disabled={searchParams.pageNum === 0}
              type="primary"
              onClick={() => {
                goPage('back');
                setPageDisabled(false);
              }}
            >
              上一页
            </DevButton>
            <DevButton disabled={pageDisabled} type="primary" onClick={() => goPage('next')}>
              下一页
            </DevButton>
          </div>
        </section>
      </Spin>
    </div>
  );
};

export default connect(
  ({ fileListModel, sqlJobModel }: { fileListModel: any; sqlJobModel: any }) => ({
    projectId: fileListModel.projectId,
    sqlJobList: sqlJobModel.sqlJobList,
    sqlJobModelData: sqlJobModel.sqlJobModelData,
  }),
)(SqlJobList);
