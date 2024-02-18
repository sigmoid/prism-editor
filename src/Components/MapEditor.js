import { useState, useEffect, useRef } from "react";
import Editor from 'react-simple-code-editor'
import {FaPaintBrush, FaTable} from 'react-icons/fa';
import {v4 as uuidv4} from 'uuid';
import useDebouncedEffect from "use-debounced-effect";
import LinkButton from "./LinkButton";
import { map } from "jquery";

const MapEditor = () =>{
    const [mapData, setMapData] = useState(null);

    const [mapWidth, setMapWidth] = useState(50);
    const [mapHeight, setMapHeight] = useState(50);
    
    const [selectedTile, setSelectedTile] = useState([0,0]);

    const [mapDisplayWidth, setMapDisplayWidth] = useState(15);
    const [mapDisplayHeight, setMapDisplayHeight] = useState(15);

    const [selectedTool, setSelectedTool] = useState();

    const [currentCursorPos, setCurrentCursorPos] = useState([0,0]);

    const inputFile = useRef(null);

    const [currentTileCode, setCurrentTileCode] = useState();

    const [isMouseDown, setIsMouseDown] = useState(false);

    const [selectedPrefab, setSelectedPrefab] = useState();

    const [prefabs, setPrefabs] = useState([
        {
            toolName: "Mountain",
            
            data: {
                tileType: 'Mountain',
                visual: '⛰️'
            }
        },
        {
            toolName: "Woods",
            data: {
                tileType: 'Woods',
                visual: '🌲'
            }
        },
        {
            toolName: "Camp",
            data: {
                tileType: 'Camp',
                visual: '⛺'
            }
        },
        {
            toolName: "Mine",
            data: {
                tileType: 'Mine',
                visual: '🪨'
            }
        },
        {
            toolName: "Blank",
            data:{
                tileType: 'Blank',
                visual: '⬜'
            }
        }
    ]);

    const [isCurrentTileDataValid, setIsCurrentTileDataValid] = useState(true);

    // Load data
    useEffect(()=>{
        const map = localStorage.getItem('currentMap');
        if(map)
        {
            const parsed = JSON.parse(map);
            setMapWidth(parsed.width);
            setMapHeight(parsed.height);
            setMapData(parsed.mapData);
        }
    },[])

    // Save data
    useDebouncedEffect(()=>{
        localStorage.setItem('currentMap', 
        JSON.stringify({mapData: mapData, width:mapWidth, height:mapHeight}));
    },1000,[mapData])

    useEffect(() => {
        try{
            const parsed = JSON.parse(currentTileCode);

            setMapData(prevMapData =>{
                let newMapData  = [...prevMapData];
                newMapData[selectedTile[1]][selectedTile[0]] = parsed;
                return newMapData;
            })

            setIsCurrentTileDataValid(true);
        }
        catch (e){
            setIsCurrentTileDataValid(false);
        }
    },
    [currentTileCode])

    useEffect(() =>{
        if(selectedTool !== 'edit-data')
        {
            setCurrentTileCode('');
        }
    }, [selectedTool])

    const createNewMap = () =>
    {
        let map = [];
        for(let y = 0; y < mapHeight; y++)
        {
            let row = []
            for(let x = 0; x < mapWidth; x++)
            {
                let cell ={
                    visual:'⬜',
                    id: uuidv4()
                };
                row.push(cell);
            }
            map.push(row);
        }

        setMapData(map);
    }

    const paintTile = (xIdx, yIdx) =>{
        if(selectedPrefab)
        {
            setMapData(prevMapData => {
                let newMap = [...prevMapData];
                newMap[yIdx][xIdx] = {...selectedPrefab.data, id:uuidv4()};
                return newMap;
            });
        }
    }

    const hoverTile = (xIdx, yIdx, tile) =>
    {
        if(selectedTool === 'paintbrush' && isMouseDown && selectedPrefab){
            paintTile(xIdx, yIdx);
        }
    } 

    const clickTile = (xIdx, yIdx, tile) =>
    {
        if (selectedTool === 'edit-data') {
            setSelectedTile([xIdx, yIdx]);
            setCurrentTileCode(JSON.stringify(tile));
        }
        if(selectedTool === 'paintbrush'){
            paintTile(xIdx,yIdx);
        }
    }

    const move = (dir) =>{
        if(dir === 'n')
        {
            setCurrentCursorPos([currentCursorPos[0], Math.max(0, currentCursorPos[1]-1)]);
        }
        if(dir === 's')
        {
            setCurrentCursorPos([currentCursorPos[0], Math.min(mapHeight - mapDisplayHeight, currentCursorPos[1]+1)]);
        }
        if(dir === 'w')
        {
            setCurrentCursorPos([Math.max(0, currentCursorPos[0]-1), currentCursorPos[1]]);
        }
        if(dir === 'e')
        {
            setCurrentCursorPos([Math.min(mapWidth - mapDisplayWidth, currentCursorPos[0]+1), currentCursorPos[1]]);
        }
    }

    const renderMapSlice = (startXPos, startYPos) =>{
        return (
            <div>
                <div><LinkButton onClick={() => { move('n') }}>move north</LinkButton></div>
                <div className="mb-5 mt-5 row align-items-center justify-content-between">
                    <div className="col">
                        <div className="float-end">
                            <LinkButton onClick={() => { move('w') }}>move west</LinkButton>
                        </div>
                    </div>
                    <div className="col">            {mapData.map((row, yIdx) => {
                        if (yIdx < mapDisplayHeight + startYPos && yIdx >= startYPos)
                            return (
                                <div className='prevent-select' key={'row-' + yIdx}>
                                    {row.map((col, xIdx) => {
                                        if (xIdx < mapDisplayWidth + startXPos && xIdx >= startXPos)
                                            return (<label key={xIdx + ',' + yIdx + '_tile'} className='ms-1' onMouseEnter={() => hoverTile(xIdx, yIdx, col)} onMouseDown={() => clickTile(xIdx, yIdx, col)} onClick={() => clickTile(xIdx, yIdx, col)}>{col.visual}</label>);
                                    })}
                                </div>
                            );
                    })}</div>
                    <div className="col">
                        <div className="float-start">
                            <LinkButton onClick={() => { move('e') }}>move east</LinkButton>
                        </div>
                    </div>
                </div>
                <div><LinkButton className="mt-4" onClick={() => { move('s') }}>move south</LinkButton></div>

            </div>
        );
    }
    
    const renderTileEditor = () => {
        if(selectedTile == null)
            return;

        return (
            <div className='d-flex justify-content-center'>
                <div className="w-75 border">
                    <Editor
                        value={currentTileCode}
                        onValueChange={code => setCurrentTileCode(code)}
                        highlight={code => code}
                    />
                    {(isCurrentTileDataValid) ? <span>✅</span>:<span>🚫</span>}
                </div>
            </div>);
    }

    const renderCursorPos = () => {
        return (<div>
            <label>cursor:  {'(' + currentCursorPos[0] + ',' + currentCursorPos[1] + ')'}</label>
        </div>)
    }

    const downloadFile = ({ data, fileName, fileType }) => {
        // Create a blob with the data we want to download as a file
        const blob = new Blob([data], { type: fileType })
        // Create an anchor element and dispatch a click event on it
        // to trigger a download
        const a = document.createElement('a')
        a.download = fileName
        a.href = window.URL.createObjectURL(blob)
        const clickEvt = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
        })
        a.dispatchEvent(clickEvt)
        a.remove()
      }
    const exportToJson = e => {
        e.preventDefault()
        downloadFile({
            data: JSON.stringify(mapData),
            fileName: 'map.json',
            fileType: 'text/json',
        })
    }

    const selectTool = (toolName) => {
        setSelectedTool(toolName);
    }

    const renderPrefabDropdown = () => {
        return (<span className="dropdown">
        <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Select Tile
        </button>
        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
            {prefabs.map((prefab, idx) => (
                <label key={idx} className="dropdown-item" onClick={() => setSelectedPrefab(prefab)} type="button">{prefab.toolName}</label>
            ))}
        </div>
      </span>);
    }

    const clearMap = () =>{
        localStorage.removeItem('currentMap');
        setMapData(null);
    }

    const renderToolbar = () => {
        return (
            <div>
                <div className="d-flex justify-content-center">
                    <div className="w-75">
                        <button className="float-right btn btn-primary m-2" onClick={exportToJson}>Export Map</button>
                        <button className="float-right btn btn-primary m-2" onClick={clearMap}>Clear Map</button>
                        <FaPaintBrush className={(selectedTool === 'paintbrush') ? 'm-2 text-primary' : 'm-2 text-secondary'} onClick={() => selectTool('paintbrush')} />
                        <FaTable className={(selectedTool === 'edit-data') ? 'm-2 text-primary' : 'm-2 text-secondary'} onClick={() => selectTool('edit-data')} />
                    </div>
                </div>
                <div className="m-3 d-flex justify-content-center">
                        <div className='w-75'>
                            {(selectedTool === 'paintbrush') ? renderPrefabDropdown() : <></>}
                        </div>
                    </div>
            </div>)
    }


    const handleFileChange = (e) => {
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onload = e => {
          setMapData(JSON.parse(e.target.result));
          setSelectedTile([0,0]);
        };
    }

    const mouseDown = () => {
        setIsMouseDown(true);
    }

    const mouseUp = () => {
        setIsMouseDown(false);
    }

    const renderMainEditor = () =>{
        if(mapData !== null)
        {
            return (
                <div onMouseDown={mouseDown} onMouseUp={mouseUp}>
                    {renderToolbar()}
                    {renderMapSlice(currentCursorPos[0], currentCursorPos[1])}
                    {renderTileEditor()}
                    {renderCursorPos()}
                    </div>);
        }
        else
        {
            return (
                <div>
                    <h3 className='mt-5'>select map</h3>
                    <div className="d-flex justify-content-center">
                        <div className='w-25'>
                            <input className='form-control' type='file' id='file-upload' onChange={handleFileChange} ref={inputFile}></input>
                        </div>
                    </div>
                    <h3 className='mt-5'>-or-</h3>
                    <h3 className='mt-5'>create new map</h3>
                    <form>
                        <div className="w-25 mt-5 form-group container">
                            <div className="row">
                                <label htmlFor="width-input">width</label>
                                <input id="width-input" className="form-control" type='number' value={mapWidth} onChange={e => {setMapWidth(e.target.value)}}></input>
                            </div>
                            <div className="row">
                                <label htmlFor="height-input">height</label>
                                <input className="form-control" id="heightInput" type='number' value={mapHeight} onChange={e => {setMapHeight(e.target.value)}}></input>
                            </div>
                        </div>
                    </form>
                    <button className="btn btn-primary m-4" onClick={createNewMap}>Create</button>
                </div>
                );
        }
    }

    return (
        <div>
            <h1>Map Editor</h1>
            {renderMainEditor()}
        </div>
    );
}

export default MapEditor;