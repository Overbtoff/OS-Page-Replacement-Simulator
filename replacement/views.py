# LRU Code Reference: https://www.geeksforgeeks.org/program-for-least-recently-used-lru-page-replacement-algorithm/
# OPT Code Reference: https://gist.github.com/alecgorge/22e2baf4585cfa4e447fbf7bc343ca7c
from os import replace
import re
from typing import Sequence, final
from django.shortcuts import render
from django.http import HttpResponse
from . import util
from django import forms
from django.urls import reverse
from django.http import HttpResponseRedirect
import markdown2
import secrets
from django.utils.safestring import mark_safe
from django.db import models

global fifofinalList, fifofinalstr, fifofault, fifohit, fiforatio
global lrufinalList, lrufinalstr, lrufault, lruhit, lruratio
global a, n, m
global optfinalList, optfinalstr, optfault, opthit, optratio


def transpose(l1, num):
    for i in l1:
        while(len(i) < num):
            i.append("-")      



    l2 = list(zip(*l1))
    #print(l1)
    #print(l2)
    return l2

def __optimal():
    global optfinalList, optfinalstr, optfault, opthit, optratio
    global a,n,m
    x = 0
    page_faults = 0
    page = []
    FREE = -1
    optallList = []
    for i in range(m):
        page.append(FREE)

    for i in range(n):        
        flag = 0
        for j in range(m):
            if(page[j] == a[i]):
                flag = 1 #hit
                temp = page[:]
                break
            
        if flag == 0:
            # look for an empty one
            faulted = False
            new_slot = FREE
            for q in range(m):
                if page[q] == FREE: #has empty
                    faulted = True
                    new_slot = q
            
            if not faulted:
                # find next use farthest in future
                max_future = 0
                max_future_q = FREE
                for q in range(m):
                    if page[q] != FREE:
                        found = False
                        for ii in range(i, n):
                            if a[ii] == page[q]:
                                found = True
                                if ii > max_future:
                                    # print "\n\tFound what will be used last: a[%d] = %d" % (ii, a[ii]),
                                    max_future = ii #ii is index in index in sequence
                                    max_future_q = q #q is index in frames (page)

                                break
                        
                        if not found:
                            # print "\n\t%d isn't used again." % (page[q]),
                            max_future_q = q
                            break

                faulted = True
                new_slot = max_future_q
            
            page_faults += 1
            #print(page)
            page[new_slot] = a[i]
        
            
            temp = page[:]
            temp[temp.index(a[i])] = 'red' + str(a[i])
        temp = list(reversed(temp))
        temp = [str(n) for n in temp]

        for jj in range(len(temp)):
            if temp[jj] == '-1':
                temp[jj] = '-'

        optallList.append(temp)
        #print(optallList)
    optfinalList = transpose(optallList, m)

    #optfinalList = [list(map(str, i)) for i in optfinalList]
    #print(optfinalList)


    optfinalstr = ''
    for lists in optfinalList:
        optfinalstr += '<tr>'
        for attr in lists:
            if 'red' in attr:
                optfinalstr += '<td style="padding: 13px;background-color:#f44336;">'+attr[3:]+'</td>'
            else:
                optfinalstr += '<td style="padding: 13px;">'+attr+'</td>'
        optfinalstr+='</tr>\n'
    optfault = page_faults
    opthit = n - page_faults
    optratio = 100.0*opthit/n
        #print(temp)

           # print("\n%d ->" % (a[i]))
            # for j in range(m):
            #     if page[j] != FREE:
            #         print(page[j])
            #     else:
            #         print("-")
        # else:
        #     print("\n%d -> No Page Fault" % (a[i]))
            
    #print("\n Total page faults : %d." % (page_faults))

def fifo(sequence, frameAmt):
    global fifofinalList, fifofinalstr, fifofault, fifohit, fiforatio
    fifoallList = []
    sequenceList = sequence
    frames = []
    hit = 0
    miss = 0
    replaceIndex = 0
    temp = []
    #fifo algorithm
    for s in sequenceList:     
        if s in frames:
            hit += 1
            if 'red' in temp[replaceIndex - 1]: #removing old "red" value
                temp[replaceIndex - 1] = temp[replaceIndex - 1][3:]

        else:
            miss += 1
            if len(frames) == frameAmt:
                frames[replaceIndex] = s
                
            else:
                frames.append(s)
            temp = frames[:] #copying the list by value
            temp[replaceIndex] = 'red'+temp[replaceIndex] #adding "red" to the new value that is replaced
            #print(temp)
            replaceIndex = (replaceIndex + 1) % frameAmt
            
        
        fifoallList.append(temp[:])

    fifofinalList = transpose(fifoallList, frameAmt) #transpose for display on the screen
    #print(fifofinalList)


    fifofinalstr = ''
    
    #adding html tags
    for lists in fifofinalList:
        fifofinalstr += '<tr>'
        for attr in lists:
            if 'red' in attr:
                fifofinalstr += '<td style="padding: 13px;background-color:#f44336;">'+attr[3:]+'</td>'
            else:
                fifofinalstr += '<td style="padding: 13px;">'+attr+'</td>'
        fifofinalstr+='</tr>\n'
    fifofault = miss
    fifohit = hit
    fiforatio = 100.0*hit/(len(sequenceList))
    #print(markdown2.markdown(fifofinalstr))
    
    
        
                
    #print(f"---FIFO---\nHit: {hit}, Miss: {miss}")


def lru(sequence, frameAmt):
    global lrufinalList, lrufinalstr, lrufault, lruhit, lruratio
    sequenceList = sequence
    frames = []
    lruallList = []
    hit = 0
    miss = 0
    temp = []

    #lru algorithm
    for s in sequenceList:
        if s not in frames:
            miss += 1
            #temp1 = frames[:]
            if len(frames) == frameAmt:
                frames.remove(frames[0])
                frames.append(s)
                temp = frames[:]
                temp[-1] = 'red'+temp[-1]
                #temp[0], temp[-1] = temp[-1], temp[0]

            else:
                frames.append(s)
                temp = frames[:]
                temp[-1] = 'red'+temp[-1]

        else:
            hit += 1
            frames.remove(s)
            frames.append(s)
            temp = frames[:]
            #temp[0], temp[-1] = temp[-1], temp[0]
            

        lruallList.append(temp)
    lrufinalList = transpose(lruallList, frameAmt)

    #adding html tags
    lrufinalstr = ''
    for lists in lrufinalList:
        lrufinalstr += '<tr>'
        for attr in lists:
            if 'red' in attr:
                lrufinalstr += '<td style="padding: 13px;background-color:#f44336;">'+attr[3:]+'</td>'
            else:
                lrufinalstr += '<td style="padding: 13px;">'+attr+'</td>'
        lrufinalstr+='</tr>\n'
    lrufault = miss
    lruhit = hit
    lruratio = 100.0*hit/(len(sequenceList))

        
    #print(f"---LRU---\nHit: {hit}, Miss: {miss}")

# def lfu(sequence, frameAmt):
#     global lfufinalList, lfufinalstr, lfufault, lfuhit, lfuratio
#     sequenceList = sequence
#     frames = []
#     lfuallList = []
#     hit = 0
#     miss = 0
#     temp = []
#     cache = {}  # 缓存，存储键和对应的值及频率
#     freq = {}  # 存储每个频率对应的键集合
#     size = 0  # 当前缓存中的数据量
#
#     # LFU算法
#     for key in sequenceList:
#         if key in cache:
#             # 缓存命中
#             hit += 1
#             cache[key]['freq'] += 1  # 增加页面的访问频率
#             # 确保 freq 字典中存在该频率的键，如果不存在则创建一个空列表
#             freq.setdefault(cache[key]['freq'], []).append(key)
#             # 更新 frames 列表，将命中的页面移动到列表末尾
#             frames.remove(key)
#             frames.append(key)
#
#             temp = frames[:]
#             temp.append(key)
#             lfuallList.append(temp)
#         else:
#             # 缓存未命中
#             miss += 1
#             if size < frameAmt:
#                 # 缓存未满，添加新项
#                 cache[key] = {'val': key, 'freq': 1}
#                 freq[1] = [key]
#                 frames.append(key)
#                 temp = frames[:]
#                 temp[-1] = 'red' + str(temp[-1])
#                 lfuallList.append(temp[:])
#                 size += 1
#             else:
#                 # 缓存已满，需要淘汰
#                 while freq:
#                     # 对频率列表进行升序排序，确保lowest_freq是最小的频率
#                     freq_list = sorted(freq.keys(), reverse=False)
#                     lowest_freq = freq_list[0]
#                     if len(freq[lowest_freq]) > 0:
#                         # 从具有最低频率的页面列表中弹出第一个页面作为被淘汰的页面
#                         evict_key = freq[lowest_freq].pop(0)
#                         if freq[lowest_freq] == []:
#                             del freq[lowest_freq]
#                         del cache[evict_key]
#                         frames.remove(evict_key)
#                         break
#                     else:
#                         # 如果最低频率的列表为空，删除这个频率
#                         del freq[lowest_freq]
#                 # 添加新项
#                 cache[key] = {'val': key, 'freq': 1}
#                 freq.setdefault(1, []).append(key)
#                 frames.append(key)
#                 temp = frames[:]
#                 temp[-1] = 'red' + str(temp[-1])
#                 lfuallList.append(temp[:])
#                 size += 1
#
#
#
#     # 转置lfuallList以生成HTML表格
#     # lfuallList.append(temp)
#     lfufinalList = transpose(lfuallList, frameAmt)
#
#     # 添加HTML标签以生成表格
#     lfufinalstr = ''
#     for lists in lfufinalList:
#         lfufinalstr += '<tr>'  # 开始新的一行
#         for attr in lists:
#             if 'red' in attr:
#                 # 如果属性中包含'red'，表示这是一个新加入缓存的元素，用红色标记
#                 lfufinalstr += '<td style="padding: 13px; background-color:#f44336;">' + attr[3:] + '</td>'
#             else:
#                 # 否则，正常添加缓存中的元素
#                 lfufinalstr += '<td style="padding: 13px;">' + attr + '</td>'
#         lfufinalstr += '</tr>\n'  # 结束当前行
#
#     # 统计和赋值
#     lfufault = miss  # 缓存未命中次数
#     lfuhit = hit  # 缓存命中次数
#     lfuratio = 100.0 * hit / (len(sequenceList) if sequenceList else 1)  # 计算命中率
#

#
def lfu(sequence, frameAmt):
    global lfufinalList, lfufinalstr, lfufault, lfuhit, lfuratio
    sequenceList = sequence
    frames = []  # 当前内存框架
    freq_map = {}  # 记录页面的使用频率
    lfuallList = []
    hit = 0
    miss = 0
    temp = []

    # LFU算法
    for s in sequenceList:
        # 页面未命中（缺页）
        if s not in frames:
            miss += 1
            # 如果框架已满，替换最少使用的页面
            if len(frames) == frameAmt:
                # 找到频率最低的页面
                min_freq = min(freq_map.values())
                candidates = [page for page in frames if freq_map[page] == min_freq]
                # 在频率相同的页面中选择最早加入的页面
                page_to_remove = candidates[0]
                frames.remove(page_to_remove)
                del freq_map[page_to_remove]

            # 添加新页面
            frames.append(s)
            freq_map[s] = 1  # 初始化页面的使用频率
            temp = frames[:]
            temp[-1] = 'red' + temp[-1]  # 高亮新增页面

        # 页面命中
        else:
            hit += 1
            freq_map[s] += 1  # 更新页面的使用频率
            temp = frames[:]  # 保持当前框架状态

        lfuallList.append(temp)

    lfufinalList = transpose(lfuallList, frameAmt)

    # 生成 HTML 表格
    lfufinalstr = ''
    for lists in lfufinalList:
        lfufinalstr += '<tr>'
        for attr in lists:
            if 'red' in attr:
                lfufinalstr += '<td style="padding: 13px;background-color:#f44336;">' + attr[3:] + '</td>'
            else:
                lfufinalstr += '<td style="padding: 13px;">' + attr + '</td>'
        lfufinalstr += '</tr>\n'

    lfufault = miss
    lfuhit = hit
    lfuratio = 100.0 * hit / len(sequenceList)




def main(sequenceString, frameAmtString):
    global a, n, m
    sequenceList = sequenceString.split()
    frameAmount = int(frameAmtString)
    fifo(sequenceList, frameAmount)
    lru(sequenceList, frameAmount)
    lfu(sequenceList, frameAmount)
    #opt(sequenceList, frameAmount)

    #for optimal
    #a = [int(n) for n in sequenceString.split()]
    a = sequenceString.split()
    m = frameAmount
    n = len(a)
    __optimal()




class EntryForm(forms.Form):
    seq = forms.CharField(label=mark_safe("Sequence"))
    frames = forms.CharField(label=mark_safe("Frame Size"))
    #submit = forms.CharField(label="Submit")




# Create your views here.
def index(request):
    if request.method == "POST":
        form = EntryForm(request.POST)
        
        sequenceString = form.cleaned_data["seq"]
        frameAmtString = form.cleaned_data["frames"]
        #print("from forms", sequenceString, frameAmtString)
    return render(request, "replacement/index.html",
    {
        "form": EntryForm()
    })

def result(request):
    global fifofinalList, fifofinalstr,fifofault, fifohit, fiforatio
    global lrufinalList, lrufinalstr, lrufault, lruhit, lruratio
    global lfufinalList, lfufinalstr, lfufault, lfuhit, lfuratio
    global optfinalList, optfinalstr, optfault, opthit, optratio
    if request.method == "POST":
        
        # form = EntryForm(request.POST)
        # #val = request.POST['sTest'] 
        # #print(val)
        # if form.is_valid():
        #     sequenceString = form.cleaned_data["seq"]
        #     frameAmtString = form.cleaned_data["frames"] 
        #     main(sequenceString, frameAmtString)
        #print(finalList)
        sequenceString = request.POST["seq"]
        frameAmtString = request.POST["fsize"]
        main(sequenceString, frameAmtString)
        #print(sequenceString, frameAmtString)
        """
        for s in finalList:
            print(s)
        """
        return render(request, "replacement/result.html",{
            "pageRefsIn": sequenceString,
            "pageRefs": len(sequenceString.split()),
            "frameCount": frameAmtString,
            "algorithm": "FIFO",
            "form": EntryForm(),
            "sequence": sequenceString.split(),
            "frameAmount": frameAmtString,

            "fifofinalList": fifofinalList,
            "fifofinalstr": fifofinalstr,
            "fifomdstring": markdown2.markdown(fifofinalstr), #markdown for html
            "fifofault": fifofault,
            "fifohit": fifohit,
            "fiforatio": round(fiforatio,2),
            "length": len(sequenceString.split()),

            "lrufinalList": lrufinalList,
            "lrufinalstr": lrufinalstr,
            "lrumdstring": markdown2.markdown(lrufinalstr), #markdown for html
            "lrufault": lrufault,
            "lruhit": lruhit,
            "lruratio": round(lruratio,2),

            "lfufinalList": lfufinalList,
            "lfufinalstr": lfufinalstr,
            "lfumdstring": markdown2.markdown(lfufinalstr),  # markdown for html
            "lfufault": lfufault,
            "lfuhit": lfuhit,
            "lfuratio": round(lfuratio, 2),

            "optfinalList": optfinalList,
            "optfinalstr": optfinalstr,
            "optfault": optfault,
            "opthit": opthit,
            "optratio": round(optratio,2),
            "optmdstring": markdown2.markdown(optfinalstr), #markdown for html
        })
    return HttpResponse("resultpage")

def step(request):
    page_refs_in = request.GET.get('pageRefsIn', '')
    page_refs = request.GET.get('pageRefs', '')
    frame_count = request.GET.get('frameCount', 0)
    algorithm = request.GET.get('algorithm', '')
    return render(request,"replacement/step.html",{
        "page_refs_in": page_refs_in,
        "page_refs": page_refs,
        "frame_count": frame_count,
        "algorithmc": algorithm
    })
