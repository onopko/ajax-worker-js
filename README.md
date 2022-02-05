# ajaxWorker

Web Workerを利用し、サブスレッドで非同期通信を実行する機能を提供します。

-----
## ファイル構成

| ファイル名 | 内容 |
| -------- | ---- |
| xhr.worker.js | サブスレッド処理を記述したWorkerファイルです。 |
| ajaxWorker.js | メインスレッド上で実行する、Worker処理の呼び出しメソッド、および定義したファイル。 |

-----
## ajaxWorker

- メインスレッドで実行するインターフェースメソッドです。
- `テキスト`, `JSON`, `XML`, `画像`, `Data URI` の取得が可能です。

### _message 引数オブジェクト

非同期通信実に必要なデータの受け渡し用オブジェクトです。

<table>
	<thead>
		<tr>
			<th>parameter</th>
			<th style="white-space: nowrap;">return value</th>
			<th>data type</th>
			<th>default</th>
			<th>example</th>
			<th>notes</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>dir</td>
			<td></td>
			<td>String</td>
			<td><code>'/'</code></td>
			<td>'/'</td>
			<td><b>xhr.worker.js</b> ファイルを設置したディレクトリへの絶対パス</td>
		</tr>
		<tr>
			<td>method</td>
			<td></td>
			<td>String</td>
			<td><code>'GET'</code></td>
			<td>'GET'</td>
			<td>通信メソッド。<code>'GET'</code> または <code>'POST'</code></td>
		</tr>
		<tr>
			<td>url</td>
			<td></td>
			<td>String</td>
			<td><code>null</code></td>
			<td>http://example.com</td>
			<td>データ取得先のURL</td>
		</tr>
		<tr>
			<td>dataType</td>
			<td></td>
			<td>String</td>
			<td><code>null</code></td>
			<td>'text'</td>
			<td><code>'text'</code>, <code>'json'</code>, <code>'xml'</code>, <code>'image'</code>, <code>'datauri'</code> のいずれか</td>
		</tr>
		<tr>
			<td>elementType</td>
			<td></td>
			<td>String</td>
			<td><code>'inline'</code></td>
			<td>'inline'</td>
			<td>dataType が <code>'image'</code> のときのみ必要。<br><code>'inline'</code> または <code>'blob'</code> のいずれか</td>
		</tr>
		<tr>
			<td>context</td>
			<td></td>
			<td>Object</td>
			<td><code>this</code></td>
			<td>this</td>
			<td>受け渡すコンテキスト</td>
		</tr>
		<tr>
			<td>data</td>
			<td></td>
			<td>Object</td>
			<td><code>null</code></td>
			<td style="white-space: nowrap;">{ property: value }</td>
			<td>送信データ</td>
		</tr>
		<tr>
			<td>timeout</td>
			<td></td>
			<td>Int</td>
			<td><code>2000</code></td>
			<td>2000</td>
			<td>非同期通信のタイムアウト（ミリ秒）</td>
		</tr>
		<tr>
			<td>cache</td>
			<td></td>
			<td>Boolean</td>
			<td><code>true</code></td>
			<td>true</td>
			<td>非同期通信のキャッシュを有効とするか</td>
		</tr>
		<tr>
			<td>headers</td>
			<td></td>
			<td>Object</td>
			<td><code>null</code></td>
			<td style="white-space: nowrap;">{ 'Content-Type': 'application/json' }</td>
			<td>送信 header に指定したいオブジェクト</td>
		</tr>
		<tr>
			<td>success</td>
			<td></td>
			<td colspan="3">Function (<code>_data</code>)</td>
			<td>成功時の処理</td>
		</tr>
		<tr>
			<td></td>
			<td>_data</td>
			<td style="white-space: nowrap;">String, Object</td>
			<td></td>
			<td></td>
			<td>取得したデータ</td>
		</tr>
		<tr>
			<td>error</td>
			<td></td>
			<td colspan="3">Function (<code>_status</code>, <code>_statusText</code>, <code>_message</code>)</td>
			<td>エラー時の処理</td>
		</tr>
		<tr>
			<td></td>
			<td>_status</td>
			<td>String</td>
			<td></td>
			<td></td>
			<td>ステータスコード</td>
		</tr>
		<tr>
			<td></td>
			<td>_statusText</td>
			<td>String</td>
			<td></td>
			<td></td>
			<td>ステータステキスト</td>
		</tr>
		<tr>
			<td></td>
			<td>_message</td>
			<td>String</td>
			<td></td>
			<td></td>
			<td>エラーメッセージ</td>
		</tr>
		<tr>
			<td>complete</td>
			<td></td>
			<td colspan="3">Function (<code>_event</code>)</td>
			<td>完了時の処理（成功・失敗に関わらず必ず実行）</td>
		</tr>
		<tr>
			<td></td>
			<td>_status</td>
			<td>Object</td>
			<td></td>
			<td></td>
			<td>非同期通信結果の戻り値オブジェクト</td>
		</tr>
	</tbody>
</table>

-----

## 実行サンプル

### **テキスト**

テキストファイルの内容やHTMLソースなど、テキストデータの取得する場合の例。

``` javascript
ajaxWorker({
	dir: '/assets/js/workers',
	method: 'GET',
	url: 'http://example.com',
	dataType: 'text',
	headers: {
		'Accept': 'text/html, application/xhtml+xml, application/xml'
	},
	success: function (_data) {
		// console.log('success', _response);

	},
	error: function (_status, _statusText, _message) {
		// console.log('error', _status, _statusText, _message);

	},
	complete: function (_event) {
		// console.log('complete', _event);

	}
});
```

### **JSON**

APIアクセス等でJSONオブジェクトを取得する場合の例。

``` javascript
ajaxWorker({
	dir: '/assets/js/workers',
	method: 'GET',
	url: 'http://example.com/api',
	dataType: 'json',
	success: function (_data) {
		// console.log('success', _response);

	},
	error: function (_status, _statusText, _message) {
		// console.log('error', _status, _statusText, _message);

	},
	complete: function (_event) {
		// console.log('complete', _event);

	}
});
```

### **XML**

APIアクセス等でXMLオブジェクトを取得する場合の例。

``` javascript
ajaxWorker({
	dir: '/assets/js/workers',
	method: 'GET',
	url: 'http://example.com/api',
	dataType: 'xml',
	success: function (_data) {
		// console.log('success', _response);

	},
	error: function (_status, _statusText, _message) {
		// console.log('error', _status, _statusText, _message);

	},
	complete: function (_event) {
		// console.log('complete', _event);

	}
});
```

### **画像**

- 画像を取得する場合の例。
- 戻り値として `inline` と `blob` の2通りの取得が可能です。

#### インラインデータで取得

``` javascript
ajaxWorker({
	dir: '/assets/js/workers',
	method: 'GET',
	url: 'http://example.com/assets/images/example.jpg',
	dataType: 'image',
	success: function (_data) {
		// console.log('success', _response);

	},
	error: function (_status, _statusText, _message) {
		// console.log('error', _status, _statusText, _message);

	},
	complete: function (_event) {
		// console.log('complete', _event);

	}
});
```

##### 成功時の戻り値（画像オブジェクト）

``` html
<img src="data:image/jpeg;base64,******************************…">
```

#### blobデータで取得

``` javascript
ajaxWorker({
	dir: '/assets/js/workers',
	method: 'GET',
	url: 'http://example.com/assets/images/example.jpg',
	dataType: 'image',
	returnType: 'blob',
	success: function (_data) {
		// console.log('success', _response);

	},
	error: function (_status, _statusText, _message) {
		// console.log('error', _status, _statusText, _message);

	},
	complete: function (_event) {
		// console.log('complete', _event);

	}
});
```

##### 成功時の戻り値（画像オブジェクト）

``` html
<img src="blob:http://example.com/************************************">
```

### **Data URI**

指定URLをData URIとして取得する場合。

``` javascript
ajaxWorker({
	dir: '/assets/js/workers',
	method: 'GET',
	url: 'http://example.com/favicon.ico',
	dataType: 'datauri',
	success: function (_data) {
		// console.log('success', _response);

	},
	error: function (_status, _statusText, _message) {
		// console.log('error', _status, _statusText, _message);

	},
	complete: function (_event) {
		// console.log('complete', _event);

	}
});
```

##### 成功時の戻り値（画像オブジェクト）

``` text
data:image/x-icon;base64,******************************…
```
