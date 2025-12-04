# SMS 服务后端 API 接口文档

## 一、基础说明

### 1.1 服务地址

- **基础 URL**: `http://localhost:5000`
- **默认端口**: `5000`

### 1.2 数据加密/解密

- **请求格式**: 前端发送 JSON 字符串，格式为 `{"s": 加密后的数据, "t": 时间戳}`
- **响应格式**:
  - 大部分接口返回：`{"s": 加密后的数据, "t": 时间戳}`
  - 特例接口（`/loginApp`、`/yt/operate/addLog`）返回明文 JSON
- **加密算法**: AES-128-CBC，密钥和 IV 基于时间戳 `t` 的前 9 位生成
- **加密库**: `utils.py` 中的 `encrypt()` 和 `decrypt()` 函数

### 1.3 认证方式

- **需要认证的接口**: 在请求头中携带 `Authorization: Bearer <JWT_TOKEN>`
- **Token 获取**: 通过 `/loginApp` 接口登录后获取
- **Token 有效期**: 默认 6 小时（可在 `config.py` 中配置 `offlineTime`）
- **JWT 载荷字段**: `sub`(userId)、`username`、`role`、`department`、`snType`

### 1.4 响应状态码

- `200`: 操作成功
- `400`: 请求参数错误
- `401`: 认证失败（Token 无效或缺失）
- `404`: 资源不存在

---

## 二、接口列表

### 2.1 用户登录

**接口地址**: `POST /loginApp`

**接口描述**: 用户登录，验证用户名和密码，返回 JWT Token

**请求头**:

```
Content-Type: application/json
```

**请求体**（加密）:

```json
{
  "s": "加密后的JSON字符串",
  "t": "时间戳（字符串）"
}
```

**解密后的请求数据**:

```json
{
  "username": "admin",
  "password": "admin"
}
```

**响应格式**（明文，不加密）:

```json
{
  "code": 200,
  "msg": "登录成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "offlineTime": 6,
  "miniVersion": 29,
  "userName": "admin",
  "role": "admin",
  "department": "des",
  "snType": 1
}
```

**错误响应**:

```json
{
  "code": 400,
  "msg": "请求解密失败: ..."
}
```

```json
{
  "code": 400,
  "msg": "缺少用户名或密码"
}
```

```json
{
  "code": 401,
  "msg": "用户名或密码错误"
}
```

**示例**:

```bash
curl -X POST http://localhost:5000/loginApp \
  -H "Content-Type: application/json" \
  -d '{"s":"加密后的数据","t":"1234567890"}'
```

---

### 2.2 添加操作日志

**接口地址**: `POST /yt/operate/addLog`

**接口描述**: 添加操作日志记录，并将日志与当前登录用户和部门绑定；当 `operateType` 为 "2" 时会更新统计字段。

**请求头**:

```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**请求体**（加密）:

```json
{
  "s": "加密后的JSON字符串",
  "t": "时间戳（字符串）"
}
```

**解密后的请求数据**:

```json
{
  "operateType": "1",
  "sendTotal": 100,
  "sendNumber": 95,
  "captureNumber": 5
}
```

**当 `operateType` 为 "2" 时，需要额外字段**:

```json
{
  "operateType": "2",
  "createTime": "2024-01-01 12:00:00",
  "sendTotal": 100,
  "sendNumber": 95,
  "captureNumber": 5
}
```

**字段说明**:

- `operateType` (必填): 操作类型，字符串
- `sendTotal` (可选): 发送总数，整数，默认 0
- `sendNumber` (可选): 发送成功数，整数，默认 0
- `captureNumber` (可选): 捕获数量，整数，默认 0
- `createTime` (条件必填): 当 `operateType == "2"` 时必须提供，格式 `yyyy-MM-dd HH:mm:ss`

**业务逻辑**:

- 当 `operateType == "2"` 时：
  - `operateTime` 使用参数 `createTime` 的值
  - 更新 `Logs` 表中第一条记录的统计字段（累加）
- 其他情况：
  - `operateTime` 使用当前时间
  - 不更新统计字段

**响应格式**（明文，不加密）:

```json
{
  "code": 200,
  "msg": "操作成功"
}
```

**错误响应**:

```json
{
  "code": 400,
  "msg": "请求解密失败: ..."
}
```

```json
{
  "code": 400,
  "msg": "缺少 operateType"
}
```

```json
{
  "code": 400,
  "msg": "operateType 为 2 时必须提供 createTime"
}
```

**示例**:

```bash
curl -X POST http://localhost:5000/yt/operate/addLog \
  -H "Content-Type: application/json" \
  -d '{"s":"加密后的数据","t":"1234567890"}'
```

---

### 2.3 添加短信记录

**接口地址**: `POST /yt/gsm/sms/addSms`

**接口描述**: 添加短信记录到数据库

**请求头**:

```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

**请求体**（加密）:

```json
{
  "s": "加密后的JSON字符串",
  "t": "时间戳（字符串）"
}
```

**解密后的请求数据**:

```json
{
  "type": "1",
  "smsNumber": "13800138000",
  "smsMsg": "这是一条测试短信"
}
```

**字段说明**:

- `type` (必填): 短信类型，字符串
- `smsNumber` (必填): 短信号码，字符串
- `smsMsg` (必填): 短信内容，字符串

**响应格式**（加密）:

```json
{
  "s": "加密后的数据",
  "t": "时间戳"
}
```

**解密后的响应数据**:

```json
{
  "code": 200,
  "msg": "操作成功"
}
```

**错误响应**（加密）:

```json
{
  "s": "加密后的错误信息",
  "t": "时间戳"
}
```

**解密后的错误数据示例**:

```json
{
  "code": 401,
  "msg": "缺少或非法的授权头"
}
```

```json
{
  "code": 401,
  "msg": "Token 无效或已过期"
}
```

```json
{
  "code": 400,
  "msg": "缺少必要的短信字段"
}
```

**示例**:

```bash
curl -X POST http://localhost:5000/yt/gsm/sms/addSms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"s":"加密后的数据","t":"1234567890"}'
```

---

### 2.4 心跳同步数据

**接口地址**: `POST /yt/heartbeatsPro`

**接口描述**: 前端定时请求此接口，同步该用户的短信记录数据

**请求头**:

```
Authorization: Bearer <JWT_TOKEN>
```

**请求体**: 无（不携带 body）

**响应格式**（外层明文，内层加密）:

```json
{
  "code": 200,
  "msg": {
    "s": "加密后的数据",
    "t": "时间戳"
  }
}
```

**解密 `msg` 后的响应数据**:

```json
{
  "snType": 1,
  "list": [
    {
      "type": "1",
      "smsNumber": "13800138000",
      "smsMsg": "这是一条测试短信"
    },
    {
      "type": "2",
      "smsNumber": "13900139000",
      "smsMsg": "另一条短信"
    }
  ]
}
```

**字段说明**:

- `snType`: 固定为 1
- `list`: 短信记录数组，包含该用户的所有短信记录

**错误响应**:

```json
{
  "code": 401,
  "msg": {
    "s": "加密后的错误信息",
    "t": "时间戳"
  }
}
```

**示例**:

```bash
curl -X POST http://localhost:5000/yt/heartbeatsPro \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 2.5 获取验证码图片

**接口地址**: `GET /captchaImage`

**接口描述**: 获取验证码图片的 UUID（示例接口）

**请求头**: 无特殊要求

**请求参数**: 无

**响应格式**（明文）:

```json
{
  "code": 200,
  "uuid": "dd292a0f-89a8-4590-8d1d-b8e03075f29b"
}
```

**示例**:

```bash
curl -X GET http://localhost:5000/captchaImage
```

---

### 2.6 获取仪表盘统计

**接口地址**: `GET /dashboard/summary`

**接口描述**: 返回登录用户可见的三项核心指标：用户总数、短信配置数量、操作记录数量，并附带当前登录账号与角色。所有登录用户均可访问。

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "userTotal": 2,
    "smsConfigTotal": 1,
    "logTotal": 260,
    "lastLoginTime": "2025-12-03 14:05:44",
    "username": "desadmin",
    "role": "admin"
  }
}
```

### 2.7 获取部门统计（仅 superadmin）

**接口地址**: `GET /dashboard/dept-summary`

**接口描述**: 仅 `superadmin` 角色可调用，返回部门数量统计，用于在仪表盘上展示“部门数量”卡片。

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "deptTotal": 5
  }
}
```

### 2.8 用户列表查询

**接口地址**: `GET /user/listAll`

**接口描述**: 查询用户列表，支持 `pageNumber` 与 `pageSize` 分页。

- `superadmin`：可查看所有部门的所有用户。
- `admin`：仅能查看与自身同部门且权限不高于自己的用户。
- 其他角色默认无权访问。

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| pageNumber | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 20 |

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 12,
        "username": "desadmin",
        "department": "des",
        "role": "admin",
        "snType": 1,
        "onlineMinutes": 854,
        "createdAt": "2025-11-30 16:35:12"
      }
    ],
    "total": 2
  }
}
```

### 2.9 创建用户（仅 superadmin）

**接口地址**: `POST /user/create`

**接口描述**: superadmin 在“新增用户”弹窗中调用。新增时需要提供用户名、密码、部门、权限、状态（snType）。请求体需要加密。

**解密后的请求示例**:

```json
{
  "username": "tester",
  "password": "123456",
  "department": "des",
  "role": "admin",
  "snType": 1
}
```

### 2.10 更新用户

**接口地址**: `PUT /user/update`

**接口描述**: 修改密码、角色或状态（snType）。`admin` 仅能编辑同部门且权限不高于自己的用户，`superadmin` 无限制。请求体需要加密。

### 2.11 更新用户部门

**接口地址**: `PATCH /user/department`

**接口描述**: 点击列表中的部门单元格时触发，更新指定用户的部门。请求体需要加密。

### 2.12 切换用户状态

**接口地址**: `PATCH /user/status`

**接口描述**: 将 `snType` 从 1（启用）切换为 0（禁用）或反之。请求体需要加密。

### 2.13 重置密码

**接口地址**: `PATCH /user/resetPassword`

**接口描述**: 将指定用户的密码重置为 `123456`（或请求体中提供的新密码）。请求体需要加密。

---

### 2.14 部门列表（仅 superadmin）

**接口地址**: `GET /dept/listAll`

**接口描述**: superadmin 打开“新增/编辑用户”弹窗时调用，用于渲染部门下拉框。

**响应示例**:

```json
{
  "code": 200,
  "data": [
    { "id": 1, "name": "des" },
    { "id": 2, "name": "ops" }
  ]
}
```

---

### 2.15 短信配置

**接口地址**: `GET /sms/list`

**接口描述**: 返回短信配置列表。

- `superadmin`：查看全部记录。
- `admin`：查看同部门用户创建的记录。

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "userId": 13,
        "username": "desit1",
        "department": "des",
        "type": "短信",
        "smsNumber": "Autostrade",
        "smsMsg": "Autostrade per l'Italia...",
        "createdAt": "2025-11-30 16:36:14"
      }
    ],
    "total": 1
  }
}
```

### 2.16 新增/编辑/删除短信配置

- `POST /sms/create`：新增记录，需要加密，字段包括 `userId/type/smsNumber/smsMsg`。
- `PUT /sms/update`：更新记录，需要加密。
- `DELETE /sms/{id}`：删除指定记录。

---

### 2.17 操作记录查询

**接口地址**: `GET /logs/list`

**接口描述**: 根据时间范围查询操作记录，并返回统计数据。默认范围为最近 7 天。

- `admin`：仅返回同部门数据。
- `superadmin`：返回所有数据。

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| startTime | string | 是 | `yyyy-MM-dd HH:mm:ss` |
| endTime | string | 是 | `yyyy-MM-dd HH:mm:ss` |
| pageNumber | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "list": [
      { "id": 235, "operateTime": "2025-12-02 17:44:19", "operateType": "类型2" }
    ],
    "total": 73,
    "summary": {
      "sendTotal": 139565,
      "captureNumber": 2150362,
      "sendSuccess": 119631,
      "userTotal": 2
    }
  }
}
```

### 2.18 获取当前登录用户信息

**接口地址**: `GET /auth/profile`

**接口描述**: 返回当前登录用户的基础信息，用于前端在全局头部或用户中心展示。

**请求头**:

```
Authorization: Bearer <JWT_TOKEN>
```

**请求参数**: 无

**响应示例**:

```json
{
  "code": 200,
  "data": {
    "username": "desadmin",
    "roles": ["admin"],
    "department": "des",
    "loginTime": "2025-12-03 14:05:44",
    "snType": 1
  }
}
```

**字段说明**:

- `username`: 当前登录用户名
- `roles`: 角色数组，目前为单个元素，如 `["admin"]` 或 `["superadmin"]`
- `department`: 用户所在部门
- `loginTime`: 当前请求时间，格式 `yyyy-MM-dd HH:mm:ss`
- `snType`: 用户状态，1 为启用，0 为禁用

---

---

## 三、错误处理

### 3.1 通用错误码

- `200`: 操作成功
- `400`: 请求参数错误或解密失败
- `401`: 认证失败（Token 无效、过期或缺失）
- `404`: 资源不存在（如用户不存在）

### 3.2 错误响应格式

- **加密接口**: 错误信息也会被加密，格式为 `{"s": "...", "t": "..."}`
- **明文接口**: 直接返回 `{"code": xxx, "msg": "错误信息"}`

### 3.3 未定义接口

- 所有未显式定义的接口请求会被捕获并记录到 `log.txt` 文件
- 返回 `{"code": 404, "msg": "接口不存在"}`

---

## 四、数据库表结构

### 4.1 users 表

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    department TEXT NOT NULL DEFAULT 'default',
    role TEXT NOT NULL DEFAULT 'user',
    snType INTEGER NOT NULL DEFAULT 1, -- 1 为启用，0 为禁用
    online_minutes INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

> 注：`online_minutes` 字段由后端按需统计，前端仅展示，不会做额外的增量更新。

### 4.2 Logs 表

```sql
CREATE TABLE Logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operateTime TEXT NOT NULL,
    operateType TEXT NOT NULL,
    sendTotal INTEGER DEFAULT 0,
    sendSuccess INTEGER DEFAULT 0,
    captureNumber INTEGER DEFAULT 0,
    userId INTEGER,
    department TEXT
);
```

### 4.3 smsRecords 表

```sql
CREATE TABLE smsRecords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    type TEXT NOT NULL,
    smsNumber TEXT NOT NULL,
    smsMsg TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);
```

---

## 五、配置说明

**配置文件**: `config.py`

- `offlineTime`: Token 过期时间（小时），默认 6
- `miniVersion`: 小程序版本号，默认 29
- `JWT_SECRET_KEY`: JWT 签名密钥（生产环境请修改）
- `SQLITE_DB_PATH`: SQLite 数据库文件路径，默认 `sms_server.db`

---

## 六、注意事项

1. **加密/解密**: 大部分接口的请求和响应都需要加密，使用 `utils.py` 中的加密函数
2. **Token 管理**: 登录后获取的 Token 需要在后续请求的 `Authorization` 头中携带
3. **时间格式**: `operateTime` 和 `createTime` 使用格式 `yyyy-MM-dd HH:mm:ss`
4. **数据库初始化**: 首次启动会自动创建表并插入默认数据（`superadmin/superadmin` 与 `desadmin/desadmin` 两个账号，以及一条默认短信记录）
5. **日志记录**: 未定义的接口请求会记录到 `log.txt`

---

## 七、快速开始

1. **安装依赖**:

```bash
pip install -r requirements.txt
```

2. **启动服务**:

```bash
python app.py
```

3. **测试登录**:

```bash
# 使用加密后的数据测试
curl -X POST http://localhost:5000/loginApp \
  -H "Content-Type: application/json" \
  -d '{"s":"加密数据","t":"时间戳"}'
```

---

**文档版本**: v1.0
**最后更新**: 2024年
