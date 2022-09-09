import AddJob from '@/pages/DataDevelopment/components/AddJob';
import FileList from '@/pages/DataDevelopment/pages/WarehouseDesign/components/FileList';
import { connect } from 'umi';
import styles from './index.less';

const FileMenu: React.FC<any> = ({ projectId }) => {
  return (
    <section className={styles.FileMenu}>
      {!!projectId && <AddJob />}
      <FileList />
    </section>
  );
};

export default connect(({ fileListModel }: { fileListModel: any }) => ({
  projectId: fileListModel.projectId,
}))(FileMenu);
