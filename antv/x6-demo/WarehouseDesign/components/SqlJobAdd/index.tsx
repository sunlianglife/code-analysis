import SqlModal from '@/components/DevModal';
import SqlJobList from './sqlJobList';
import SqlJobContent from './sqlJobContent';
import styles from './index.less';
import { useRef, useState } from 'react';
import DevButton from '@/components/DevButton';
import { Resizable } from 're-resizable';
import { connect } from 'dva';

interface IProps {
  visible: boolean;
  tabKey: string;
  onCancel: () => void;
  dataLoading: boolean;
  sqlJobModelData: any;
  dataLoadingUpdate: any;
}

const textStatus = {
  add: 'SQL作业（新增）',
  edit: 'SQL作业（编辑）',
  preview: 'SQL作业详情',
};

const SqlJobAdd: React.FC<IProps> = (props) => {
  const { visible, onCancel, dataLoading, sqlJobModelData, dataLoadingUpdate, tabKey } = props;
  const childRef = useRef<any>();
  const [moveWidth, setMoveWidth] = useState(0);
  const [stopWidth, setStopWidth] = useState(0);
  const [addName, setAddName] = useState('')

  // 重置位置
  // const resetWidth = () => {
  //   setMoveWidth(0);
  //   setStopWidth(0);
  // };

  const save = () => {
    if (childRef?.current?.checkParams) {
      childRef?.current?.checkParams();
    }
  };

  // 命令预览
  const commandPreview = () => {
    if (childRef?.current?.commandPreview) {
      childRef?.current?.commandPreview();
    }
  };

  const childName = (name: any) => {
    setAddName(name)
  }

  return (
    <div className={styles.SqlJobAdd}>
      {visible && (
        <SqlModal
          visible={visible}
          forceRender
          // confirmLoading={dataLoading}
          title={<span>{
            // eslint-disable-next-line no-nested-ternary
            sqlJobModelData?.data?.type !== 'add' && !addName
            ? `${textStatus[sqlJobModelData?.data?.type]}- ${tabKey === 'dev' ? sqlJobModelData?.data?.title : sqlJobModelData?.data?.title.replace('test_', '')}`
            : (addName ?  `${textStatus[sqlJobModelData?.data?.type]}- ${addName}` : textStatus[sqlJobModelData?.data?.type])
          }</span>

          }
          okText="确定"
          cancelText="取消"
          width="80%"
          onCancel={onCancel}
          bodyStyle={{ height: '760px', padding: 0 }}
          // onOk={()=> form.submit()}
          destroyOnClose
          footer={null}
          closable={false}
          centered
        >
          <div className={styles.content}>
            {tabKey === 'dev' && (
              <Resizable
                defaultSize={{ width: 250, height: '100%' }}
                minWidth={250}
                maxWidth={500}
                enable={{
                  top: false,
                  right: true,
                  bottom: false,
                  left: false,
                  topRight: false,
                  bottomRight: false,
                  bottomLeft: false,
                  topLeft: false,
                }}
                onResize={(e: any, direction: any, ref: any, d: any) => {
                  console.log('size', d);
                  setMoveWidth(stopWidth + d.width);
                }}
                onResizeStop={(e: any, direction: any, ref: any, d: any) => {
                  console.log('stop', d);
                  setStopWidth(stopWidth + d.width);
                }}
              >
                <section className={styles.leftSection} style={{ width: `${250 + moveWidth}px` }}>
                  <SqlJobList moveWidth={moveWidth} />
                </section>
              </Resizable>
            )}
            <section className={styles.rightSection}>
              <SqlJobContent childName={childName} cRef={childRef} onCancel={onCancel} moveWidth={moveWidth} />
            </section>
          </div>
          <div style={{ position: 'absolute', top: '9px', right: '47px' }}>
            <DevButton onClick={commandPreview}>命令预览</DevButton>
            <DevButton onClick={onCancel} style={{ marginLeft: '10px' }}>
              取消
            </DevButton>
            <DevButton
              onClick={save}
              type="primary"
              style={{ marginLeft: '10px' }}
              loading={dataLoading || dataLoadingUpdate}
              disabled={sqlJobModelData?.data?.type === 'preview'}
            >
              确认
            </DevButton>
          </div>
        </SqlModal>
      )}
    </div>
  );
};

export default connect(
  ({
    sqlJobModel,
    fileListModel,
    loading,
  }: {
    sqlJobModel: any;
    fileListModel: any;
    loading: { effects: Record<string, boolean> };
  }) => ({
    dataLoading: loading.effects['sqlJobModel/saveJob'],
    dataLoadingUpdate: loading.effects['sqlJobModel/editJob'],
    sqlJobModelData: sqlJobModel.sqlJobModelData,
    tabKey: fileListModel.tabKey,
  }),
)(SqlJobAdd);
