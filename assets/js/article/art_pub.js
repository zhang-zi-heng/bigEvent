$(function () {
    var layer = layui.layer
    var form = layui.form

    initCase()
    // 调用文本编辑器
    initEditor()

    // 初始化获取文章数据
    function initCase() {
        $.ajax({
            url: '/my/article/cates',
            type: 'GEt',
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('初始化请求数据失败')
                }
                // 调用模板引擎
                var htmlStr = template('tpl-cate', res)
                $('[name=cate_id]').html(htmlStr)

                // 调用后 一定要重新渲染页面 否则不显示
                form.render()
            }
        })
    }

    // 1. 初始化图片裁剪器
    var $image = $('#image')
    // 2. 裁剪选项
    var options = {
        aspectRatio: 400 / 280,
        preview: '.img-preview'
    }
    // 3. 初始化裁剪区域 
    $image.cropper(options)

    // 监听点击事件  当点击选择封面按钮时,调用隐藏的文本选择框点击事件
    $("#btnChooseImage").on('click', function () {
        $("#coverFile").click()
    })

    // 给隐藏的文件选择框 创建一个change事件
    $("#coverFile").on('change', function (e) {
        console.log(e);
        // 判断是否选择文件
        var files = e.target.files
        if (files.length === 0) {
            return
        }
        var newImgURL = URL.createObjectURL(files[0])
        $image
            .cropper('destroy') // 销毁旧的裁剪区域 
            .attr('src', newImgURL) // 重新设置图片路径 
            .cropper(options) // 重新初始化裁剪区域
    })

    // 定义文章的发布状态
    var art_state = '已发布'

    // 点击存为草稿,绑定事件
    $('#btnSave2').on('click', function (e) {
        art_state = '草稿'
    })

    // 为表单提交submit事件
    $('#form-pub').on('submit', function (e) {
        // 1.阻止表单的默认行为
        e.preventDefault()
        // 2. 基于form表单 ,快速创建一个FormData对象
        var fd = new FormData($(this)[0])
        // 3.将文章发布状态,存到fd中
        fd.append('state', art_state)
        // 4. 将封面裁剪后的图片,输出为一个文件对象
        $image
            .cropper('getCroppedCanvas', {
                // 创建一个 Canvas 画布
                width: 400,
                height: 280
            })
            .toBlob(function (blob) {
                // 将 Canvas 画布上的内容，转化为文件对象 
                // 得到文件对象后，进行后续的操作
                // 5. 将文件对象,存储到 fd 中
                fd.append('cover_img', blob)
                // 6. 发起 ajax 数据请求
                publishArticle(fd)
            })
    })

    // 定义一个发布文章的方法
    function publishArticle(fd) {
        $.ajax({
            method: 'POST',
            url: '/my/article/add',
            data: fd,
            // 注意：如果向服务器提交的是 FormData 格式的数据，
            // 必须添加以下两个配置项
            contentType: false,
            processData: false,
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('发布文章失败！')
                }
                layer.msg('发布文章成功！')
                // 发布文章成功后，跳转到文章列表页面
                location.href = '/artical/art_list.html'
            }
        })
    }
})