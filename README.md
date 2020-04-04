# JSON-On-Relations
JSON-On-Relations(JOR) is an entity framework in NodeJS.

JOR provides entity modeling tools which can generate tables in relational database(MySQL). 
It then allows you to compose JSON messages to query and manipulate data.

JOR is not trying to introduce a new SQL-like grammar over HTTP, but to reduce the number of RESTful endpoints. 
By composing JSON messages, developers can achieve most of the data manipulations without any server side coding. 
By grouping relevant attributes in Relations and traversing relationships among entities, 
the over-fetching and under-fetching issues are well resolved

Here gives an [example](https://vincezk.github.io/Portal/) on how to build a CRUD App with JSON-On-Relations. 
Also check the videos:
+ [youtube](https://www.youtube.com/playlist?list=PLYO0p46tFifM51zhDNtapS99pF2ysUdvy)
+ [bilibili](https://www.bilibili.com/video/av73399543/)

## License
[The Apache-2.0 License](https://opensource.org/licenses/Apache-2.0)

   Copyright 2020 VinceZK

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.


