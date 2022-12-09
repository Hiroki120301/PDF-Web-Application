/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import Navbar from "./Navbar";
import { Auth, Amplify, Storage } from 'aws-amplify';
import { Breadcrumb, Layout, Button, Modal, Space, Divider, Row, Col, Table, Tag } from 'antd';
import { ColorTypes, PDFDocument } from 'pdf-lib';
import Input from 'antd/lib/input/Input';
const { Header, Footer, Sider, Content } = Layout;
Storage.configure({ level: 'public' });

const Dashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isMergeOpen, setIsMergeOpen] = useState(false);
    const [isSplitOpen, setIsSplitOpen] = useState(false);
    const [hasInput, setHasInput] = useState(false);
    const [splitInput, setSplitInput] = useState(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState('');
    const [mergeTargetKey, setMergeTargetKey] = useState(null);
    const [firstPDF, setfirstPDF] = useState(null);
    const [secondPDF, setsecondPDF] = useState(null);
    const [resultPDF, setResultPDF] = useState(null);
    const [resultPDFTwo, setResultPDFTwo] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [loaded, setLoaded] = useState(0);
    const [loadedKey, setLoadedKey] = useState(0);
    const [pdfList, setPdfList] = useState(new Array());
    const [pdfString, setPdfString] = useState('')
    const [shareDialog, setShareDialog] = useState(false)
    const [shareString, setShareString] = useState('')
    const [shareMsg, setShareMsg] = useState("")
    const [tag1, setTag1] = useState("")
    const [tag2, setTag2] = useState("")
    const [tag3, setTag3] = useState("")

    const handleCancel = () => {
        setSelectedFile(null);
        setIsModalOpen(false);
        setIsUploadOpen(false)
        setSplitInput(null);
        getList()
    };

    const closePreview = () => {
        setIsPreviewOpen(false)
    }

    const closeMerge = () => {
        setIsMergeOpen(false)
    }
    
    const closeSplit = () => {
        setIsSplitOpen(false)
        setSplitInput(null);
    }


    const handleChange = event => {
        setSplitInput(event.target.value);
        setHasInput(true)
      };
    
    async function handleDownload(e) {
        const result = await Storage.get(e, {download: true});
        setLoaded(result)
        const url = URL.createObjectURL(result.Body);
        setPdfString(url)
        setLoadedKey(e)
        setIsPreviewOpen(true)
    }

    async function handleMergeTarget(e){
        setMergeTargetKey(e)
        return mergeTargetKey
    }

    async function handleEdit(isMerge) {
        const url = pdfString
        const arrayBuffer = await fetch(url).then(res => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setfirstPDF(pdfDoc)
        if(isMerge)
            setIsMergeOpen(true)
        else
            setIsSplitOpen(true)
    }

    async function handleMerge(e) {       
        const mergedPdf = await PDFDocument.create();

        const result = await Storage.get(e, {download: true});
        const url = URL.createObjectURL(result.Body);
        setPdfString(url)
        const mergeUrl = pdfString
        const arrayBuffer = await fetch(mergeUrl).then(res => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setsecondPDF(pdfDoc)

        const copiedPagesA = await mergedPdf.copyPages(firstPDF, firstPDF.getPageIndices());
        copiedPagesA.forEach((page) => mergedPdf.addPage(page));

        const copiedPagesB = await mergedPdf.copyPages(secondPDF, secondPDF.getPageIndices());
        copiedPagesB.forEach((page) => mergedPdf.addPage(page));

        const mergedPdfFile = await mergedPdf.save();
        setResultPDF(mergedPdfFile)

        //upload merged file
        console.log(resultPDF)
        const file = resultPDF;
        file.name = loadedKey + " merged"
        const user = await Auth.currentAuthenticatedUser();
        let key = user.username +'/' + file.name
        key = await nameDocument(key)
        //console.log("tags @ upload: " + tag1 + ", " +tag2 + ", " + tag3)
        try {
            await Storage.put(key, file, {
              contentType: "application/pdf", // contentType is optional
                
            });
          } catch (error) {
            console.log("Error uploading file: ", error);
          }

        setIsMergeOpen(false)
        setIsPreviewOpen(false)
        handleCancel()
    }

    async function handleSplit(){
        //console.log(e)
        const subDocument1 = await PDFDocument.create();
        const subDocument2 = await PDFDocument.create();
        setTotalPages(firstPDF.getPageCount())
        if(splitInput >= totalPages || splitInput <= 0){
            setIsSplitOpen(false)
            setIsPreviewOpen(false)
            handleCancel()
            return;
        }
        else{
            for(let i = 0; i < splitInput; i++){
                const [partedPage] = await subDocument1.copyPages(firstPDF, [i])
                subDocument1.addPage(partedPage)
            }

            for(let i = splitInput; i < totalPages; i++){
                const [partedPage2] = await subDocument2.copyPages(firstPDF, [i])
                subDocument2.addPage(partedPage2)
            }
            const mergedPDFHalf = await subDocument1.save();
            const mergedPDFHalf2 = await subDocument2.save();
            setResultPDF(mergedPDFHalf)
            setResultPDFTwo(mergedPDFHalf2)

            const file = resultPDF
            const file2 = resultPDFTwo
            console.log(file.name)
            file.name = loadedKey + "_head"
            file2.name = loadedKey + "_tail"
            const user = await Auth.currentAuthenticatedUser();
            let key = user.username +'/' + file.name
            let key2 = user.username +'/' + file2.name
            key = await nameDocument(key)
            key2 = await nameDocument(key2)
            //console.log("tags @ upload: " + tag1 + ", " +tag2 + ", " + tag3)
            try {
                await Storage.put(key, file, {
                contentType: "application/pdf", // contentType is optional    
                });
                await Storage.put(key2, file2, {
                    contentType: "application/pdf", // contentType is optional    
                    });
            } catch (error) {
                console.log("Error uploading file: ", error);
            }

            setIsSplitOpen(false)
            setIsPreviewOpen(false)
            handleCancel()
        }
    }

    async function handleUpload(fileIn) {
        console.log(fileIn)
        const file = fileIn;
        const user = await Auth.currentAuthenticatedUser();
        let key = user.username +'/' + file.name
        key = await nameDocument(key)
        console.log("tags @ upload: " + tag1 + ", " +tag2 + ", " + tag3)
        try {
            await Storage.put(key, file, {
              contentType: "application/pdf", // contentType is optional
              metadata: {
              ['1']: tag1.toString(),
              ['2']: tag2.toString(),
              ['3']: tag3.toString()
            }  
            });
          } catch (error) {
            console.log("Error uploading file: ", error);
          }
        handleCancel()
    }

    useEffect(() => {
        const fetchData = async () => {
            const user = await Auth.currentAuthenticatedUser();
            const key = user.username + '/'
            const list = await Storage.list(key, { level: 'public' })
            const numpdf = list.results.length
            const pdfListData = new Array(numpdf)
            for (let index = 0; index < numpdf; index++) {
                const realName = list.results[index].key
                let obj = await Storage.get(realName, {download: true})
                //console.log(obj.Metadata)
                let tagList = [3]
                for (let i = 1; i < 4; i++) {
                    tagList[i-1] = obj.Metadata[i]
                }
                console.log("Taglist: " + tagList)
                pdfListData[index] = {
                    key: index.toString,
                    s3key: realName,
                    name: realName.substring(key.length),
                    size: list.results[index].size + ' B',
                    lastedit: list.results[index].lastModified.toISOString(),
                    tags: tagList
                }
            }
            setPdfList(pdfListData)
        }
        fetchData()
    }, []);
     
    async function getList() {
        const user = await Auth.currentAuthenticatedUser();
        const key = user.username + '/'
        const list = await Storage.list(key, { level: 'public' })
        const numpdf = list.results.length
        const pdfListData = new Array(numpdf)
        for (let index = 0; index < numpdf; index++) {
            const realName = list.results[index].key
            let obj = await Storage.get(realName, {download: true})
            console.log(obj.Metadata)
            let tagList = [3]
            for (let i = 1; i < 4; i++) {
                tagList[i-1] = obj.Metadata[i]
            }
            //console.log("Taglist: " + tagList)
            pdfListData[index] = {
                key: index.toString,
                s3key: realName,
                name: realName.substring(key.length),
                size: list.results[index].size + ' B',
                lastedit: list.results[index].lastModified.toISOString(),
                tags: tagList
            }
        }
        setPdfList(pdfListData)
    }

    const closeShareDialog = () => {
        setShareDialog(false)
    }

    const showShareDialog = () => {
        setShareDialog(true)
    }

    const showUpload = () => {
        setIsUploadOpen(true)
    }

    const closeUpload = () => {
        setIsUploadOpen(false)
    }

    async function userExist(userName) {
        return Auth.signIn( userName, ' ')
        .then( res => {
            return false;
        } )
        .catch( error => {
            const code = error.code;
            console.log( error );
            switch ( code ) {
                case 'NotAuthorizedException':
                    return true;
                default:
                    return false;
            }
        } );
    }

    async function nameDocument(intitialKey) {
        let exists = false
        const doc = await Storage.get(intitialKey, {download: true})
        .then( res => {
            exists = true;
        } )
        .catch( error => { 
            exists = false;
        })
        if (exists) {
            const lastChar = intitialKey.substring(intitialKey.length -1)
            const integerValue = parseInt(lastChar)
            let newName = ""
            //Maybe add place for merge split naming
            if (isNaN(integerValue)) {
                newName = intitialKey + " 1"
            } else {
                newName = intitialKey.substring(0, intitialKey.length -1)
                let num = integerValue + 1
                num = num.toString()
                newName = newName + num
            }   
            console.log("rerun with name: " + newName)
            return nameDocument(newName)
        } else {
            return intitialKey
        }
    }

    async function shareDocument(event) {
        event.preventDefault();
        const user = await Auth.currentAuthenticatedUser();
        const userExists = await userExist(shareString)
        const key = await nameDocument(shareString + '/' + loadedKey.slice(user.username.length + 1))
        if (userExists) {
            try {
                console.log("putting document at: " + key)
                await Storage.put(key , loaded.Body, {
                  contentType: "application/pdf", // contentType is optional
                });
                setShareMsg("")
                handleCancel()
                setShareDialog(false)
              } catch (error) {
                setShareMsg("Error uploading file: " + error)
                console.log("Error uploading file: ", error);
              }
            
        } else {
            setShareDialog("")
            setShareMsg("Invalid User")
        }
    }

    const handleSelectedFile = (e) => {
       setSelectedFile(e.target.files[0])
    }

    return (
        <>
        <Layout className="layout">
            <Header style={{ backgroundColor: '#b6d7a8' }}>
                <Navbar/>
            </Header>       
            <Content style={{ padding: '0 50px' }}>
                <Layout>
                    <Modal title="Document Preview" open={isPreviewOpen} onCancel={closePreview} footer={null} centered='true' width='1200'>
                        <Row>
                            <Col span={4}>
                                <Button onClick={showShareDialog}>Share</Button>
                            </Col>
                            <Col span={4}>
                                <Button onClick={async () => {await handleEdit(true);}}>Merge</Button>
                            </Col>
                            <Col span={4}>
                                <Button onClick={async () => {await handleEdit();}}>Split</Button>
                            </Col>
                        </Row>
                        <Divider />
                        <Modal title="Share" open={shareDialog} onCancel={closeShareDialog} footer={null} centered='true' width='120'>
                            <div>
                                <div>{shareMsg}</div>
                                <input type="text" id="username" value={shareString} placeholder="Target Username" onChange={(e)=>setShareString(e.target.value)}/>
                                <Button onClick={shareDocument}>Submit</Button>
                            </div>
                        </Modal>
                        <Row><embed src={pdfString} width="1200" height="550"></embed></Row>
                    </Modal>
                    <Divider />
                    <Button onClick={showUpload}>Upload</Button>
                    <Modal title="Upload Document" open={isUploadOpen} onCancel={closeUpload} footer={null} centered='true' width='120'>
                        <Row>
                                <Col>
                                <Space direction="vertical">
                                    <label className="label">Upload a pdf</label>
                                    <input type="file" accept=".pdf" className="input" placeholder="Username" onChange={handleSelectedFile} />
                                    <button onClick={() => handleUpload(selectedFile)}>Upload</button>
                                </Space>
                                </Col>
                                <Col >
                                <Space direction="vertical">
                                    <input type="text" id="tag1" value={tag1} placeholder="Tag 1" onChange={(e)=>setTag1([e.target.value])}/>
                                    <input type="text" id="tag2" value={tag2} placeholder="Tag 2" onChange={(e)=>setTag2([e.target.value])}/>
                                    <input type="text" id="tag3" value={tag3} placeholder="Tag 3" onChange={(e)=>setTag3([e.target.value])}/>
                                </Space>
                                </Col>
                            
                        </Row>
                    </Modal>
                    <Divider />
                    <Modal title="Document to Merge" open={isMergeOpen} onCancel={closeMerge || closePreview} footer={null} centered='true' width='1200'>
                    <Table columns={[
                        {
                            title: 'Name',
                            dataIndex: 'name',
                            key: 'name',
                            render: (text, record) => <Button type="primary" onClick={async () => {await handleMerge(record.s3key);}}>{text}</Button>
                        },
                        {
                            title: 'Last Edited:',
                            dataIndex: 'lastedit',
                            key: 'lastedit',
                        }
                    ]} dataSource={pdfList} />
                    </Modal>
                <Divider />
                <Modal title="Split after page..." open={isSplitOpen} onCancel={closeSplit || closePreview} footer={null} centered='true' width='1200'>
                   <Input type="number" onChange={handleChange} value={splitInput} placeholder='Insert Page Number'></Input>
                    <br/>
                    <br/>
                   <Button type="primary" disabled={!hasInput} onClick={async () => {await handleSplit();}}>Confirm</Button>
                </Modal>
                <Divider />
                <div className="site-layout-content">
                    <Table columns={[
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          render: (text, record) => <Button type="primary" onClick={async () => {await handleDownload(record.s3key);}}>{text}</Button>
        },
        {
          title: 'Size',
          dataIndex: 'size',
          key: 'size',
        },
        {
          title: 'Last Edited:',
          dataIndex: 'lastedit',
          key: 'lastedit',
        },
        {
            title: 'Tags',
            key: 'tags',
            dataIndex: 'tags',
            render: (_, {tags}) => (
              <Space size = "middle">
                {tags.map((tag) => {
                  //let color = '#c3e3c9';
                  return (
                    <Tag key={tag}>
                      {tag.toUpperCase()}
                    </Tag>
                  );
                })}
              </Space>
            ),
          }
    ]} dataSource={pdfList} /> </div>
                </Layout>
            </Content>
            <Footer style={{ textAlign: 'center' }}>Luis Segovia Fan Club ©2022 Created by James Redding, Maxwell Ryan, Hiroki Nakayama, Tiger Tian, Kerry Nettles, and Kieran Williams</Footer>
        </Layout>
        </>
    )
}
 
export default Dashboard