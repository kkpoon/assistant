var gulp = require("gulp");
var zip = require("gulp-zip");
var del = require("del");
var runSequence = require("run-sequence");
var install = require("gulp-install");
var lambda = require("gulp-awslambda");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

gulp.task("clean", function() {
    return del(["./dist", "./dist.zip"]);
});

gulp.task("ts", function() {
    return tsProject.src().pipe(tsProject()).js.pipe(gulp.dest("dist"));
});

gulp.task("node-mods", function() {
    return gulp
        .src("./package.json")
        .pipe(gulp.dest("dist/"))
        .pipe(install({ production: true }));
});

gulp.task("upload", function() {
    return gulp
        .src(["dist/**/*", "!dist/package.json"])
        .pipe(zip("dist.zip"))
        .pipe(
            lambda(
                {
                    Description: "kkpoon assistant",
                    FunctionName: "kkpoon_assistant",
                    Handler: "index.handler",
                    Role: process.env.LAMBDA_ROLE_ARN,
                    Timeout: 20,
                    MemorySize: 128,
                    Runtime: "nodejs6.10",
                    Environment: {
                        Variables: {
                            FACEBOOK_PAGE_ACCESS_TOKEN: process.env
                                .FACEBOOK_PAGE_ACCESS_TOKEN,
                            FACEBOOK_APP_SECRET: process.env
                                .FACEBOOK_APP_SECRET,
                            FACEBOOK_VALIDATION_TOKEN: process.env
                                .FACEBOOK_VALIDATION_TOKEN
                        }
                    }
                },
                {
                    publish: true,
                    region: "us-east-1"
                }
            )
        )
        .pipe(gulp.dest("."));
});

gulp.task("deploy:lambda", function(callback) {
    return runSequence(
        ["clean"],
        ["ts", "node-mods"],
        ["upload"],
        callback
    );
});
