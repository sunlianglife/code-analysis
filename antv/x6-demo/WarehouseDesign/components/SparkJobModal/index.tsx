import SqlModal from '@/components/DevModal';
import SparkJobModal from './sparkJobContent';
import { useRef } from 'react';
import DevButton from '@/components/DevButton';
import { connect } from 'dva';

interface IProps {
  visible: boolean;
  tabKey: string;
  onCancel: () => void;
  dataLoading: boolean;
  sparkJobModelData: any;
  dataLoadingUpdate: any;
}

const textStatus = {
  add: 'Spark作业（新增）',
  edit: 'Spark作业（编辑）',
  preview: 'Spark作业详情',
};

const SparkJobAdd: React.FC<IProps> = (props) => {
  const { visible, onCancel, dataLoading, sparkJobModelData, dataLoadingUpdate, tabKey } = props;
  const childRef = useRef<any>();

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

  return (
    <div>
      {visible && (
        <SqlModal
          visible={visible}
          forceRender
          // confirmLoading={dataLoading}
          title={
            sparkJobModelData?.data?.type !== 'add'
              ? `${textStatus[sparkJobModelData?.data?.type]}-${
                  tabKey === 'dev'
                    ? sparkJobModelData?.data?.title
                    : sparkJobModelData?.data?.title.replace('test_', '')
                }`
              : textStatus[sparkJobModelData?.data?.type]
          }
          okText="确定"
          cancelText="取消"
          width="80%"
          onCancel={onCancel}
          // onOk={()=> form.submit()}
          destroyOnClose
          footer={null}
          closable={false}
          centered
        >
          <div>
            <section>
              <SparkJobModal cRef={childRef} onCancel={onCancel} />
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
              disabled={sparkJobModelData?.data?.type === 'preview'}
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
    sparkJobModelData: sqlJobModel.sparkJobModelData,
    tabKey: fileListModel.tabKey,
  }),
)(SparkJobAdd);
